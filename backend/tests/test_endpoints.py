import pytest
from datetime import datetime, timedelta
from api import app, db, Document, Session
import json

def test_get_documents_success(test_app, test_client, test_session):
    with test_app.app_context():
        # Create some test documents
        docs = []
        for i in range(3):
            doc = Document(
                document_url=f'test_url_{i}',
                session_id=test_session.id
            )
            doc.set_encrypted_content({'content': f'test_content_{i}'})
            doc.set_encrypted_title({'title': f'test_title_{i}'})
            docs.append(doc)
        
        db.session.add_all(docs)
        db.session.commit()
        
        # Test the endpoint
        response = test_client.get(f'/api/sessions/{test_session.address}/documents')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'data' in data
        assert 'documents' in data['data']
        assert 'total' in data['data']
        
        # Verify response data
        documents = data['data']['documents']
        assert len(documents) == 3
        assert data['data']['total'] == 3
        
        # Verify document structure
        for doc in documents:
            assert 'id' in doc
            assert 'encryptedTitle' in doc
            assert 'createdAt' in doc
            assert 'lastModified' in doc

def test_get_documents_pagination(test_app, test_client, test_session):
    with test_app.app_context():
        # Create 15 test documents
        docs = []
        for i in range(15):
            doc = Document(
                document_url=f'test_url_{i}',
                session_id=test_session.id
            )
            doc.set_encrypted_content({'content': f'test_content_{i}'})
            doc.set_encrypted_title({'title': f'test_title_{i}'})
            docs.append(doc)
        
        db.session.add_all(docs)
        db.session.commit()
        
        # Test first page (default 10 items)
        response = test_client.get(f'/api/sessions/{test_session.address}/documents')
        data = json.loads(response.data)
        assert len(data['data']['documents']) == 10
        assert data['data']['total'] == 15
        
        # Test second page
        response = test_client.get(f'/api/sessions/{test_session.address}/documents?page=2')
        data = json.loads(response.data)
        assert len(data['data']['documents']) == 5
        assert data['data']['total'] == 15

def test_get_documents_invalid_session(test_app, test_client):
    response = test_client.get('/api/sessions/nonexistent_session/documents')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Session not found'

# def test_get_documents_expired_session(test_app, test_client, test_session):
#     with test_app.app_context():
#         # Set session created_at to 13 hours ago (expired)
#         test_session.created_at = datetime.utcnow() - timedelta(hours=13)
#         db.session.commit()
        
#         response = test_client.get(f'/api/sessions/{test_session.address}/documents')
#         assert response.status_code == 401
#         data = json.loads(response.data)
#         assert 'error' in data
#         assert 'Session expired' in data['error']

def test_get_documents_rate_limit(test_app, test_client, test_session):
    # Test rate limiting by making multiple requests
    for _ in range(61):  # Limit is 60 per minute
        response = test_client.get(f'/api/sessions/{test_session.address}/documents')
    
    assert response.status_code == 429
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Rate limit exceeded' in data['error']

def test_get_document_success(test_app, test_client, test_session):
    with test_app.app_context():
        # Create a test document
        doc = Document(
            document_url='test_doc_url',
            session_id=test_session.id
        )
        test_content = {'content': 'test_encrypted_content'}
        doc.set_encrypted_content(test_content)
        doc.set_encrypted_title({'title': 'test_title'})
        
        db.session.add(doc)
        db.session.commit()
        
        # Test the endpoint
        response = test_client.get(
            f'/api/sessions/{test_session.address}/documents/{doc.document_url}'
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'data' in data
        
        # Verify document structure
        document = data['data']
        assert document['id'] == doc.document_url
        assert document['encryptedContent'] == test_content
        assert document['sessionId'] == test_session.address
        assert 'createdAt' in document
        assert 'lastModified' in document

def test_get_document_invalid_session(test_app, test_client):
    response = test_client.get(
        '/api/sessions/nonexistent_session/documents/some_document'
    )
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Session not found'

def test_get_document_invalid_document(test_app, test_client, test_session):
    response = test_client.get(
        f'/api/sessions/{test_session.address}/documents/nonexistent_document'
    )
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Document not found'

def test_get_document_wrong_session(test_app, test_client, test_session):
    with test_app.app_context():
        # Create another session
        other_session = Session(
            address='other_session_address',
            salt='other_session_salt'
        )
        db.session.add(other_session)
        db.session.commit()
        
        # Create a document in the first session
        doc = Document(
            document_url='test_doc_url',
            session_id=test_session.id
        )
        doc.set_encrypted_content({'content': 'test_content'})
        doc.set_encrypted_title({'title': 'test_title'})
        db.session.add(doc)
        db.session.commit()
        
        # Try to access the document using the other session
        response = test_client.get(
            f'/api/sessions/{other_session.address}/documents/{doc.document_url}'
        )
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Document not found'

# def test_get_document_expired_session(test_app, test_client, test_session):
#     with test_app.app_context():
#         # Create a test document
#         doc = Document(
#             document_url='test_doc_url',
#             session_id=test_session.id
#         )
#         doc.set_encrypted_content({'content': 'test_content'})
#         doc.set_encrypted_title({'title': 'test_title'})
#         db.session.add(doc)
        
#         # Set session created_at to 13 hours ago (expired)
#         test_session.created_at = datetime.utcnow() - timedelta(hours=13)
#         db.session.commit()
        
#         # Try to access the document with expired session
#         response = test_client.get(
#             f'/api/sessions/{test_session.address}/documents/{doc.document_url}'
#         )
#         assert response.status_code == 401
#         data = json.loads(response.data)
#         assert 'error' in data
#         assert 'Session expired' in data['error'] 

def test_create_document_success(test_app, test_client, test_session):
    with test_app.app_context():
        test_content = {'content': 'test_encrypted_content'}
        test_title = {'title': 'test_encrypted_title'}
        
        # Test the endpoint
        response = test_client.post(
            f'/api/sessions/{test_session.address}/documents',
            json={
                'encryptedContent': test_content,
                'encryptedTitle': test_title
            }
        )
        assert response.status_code == 201
        
        data = json.loads(response.data)
        assert 'data' in data
        
        # Verify document structure
        document = data['data']
        assert 'id' in document
        assert document['encryptedContent'] == test_content
        assert document['encryptedTitle'] == test_title
        assert document['sessionId'] == test_session.address
        assert 'createdAt' in document
        assert 'lastModified' in document
        
        # Verify document was actually saved in database
        saved_doc = Document.query.filter_by(document_url=document['id']).first()
        assert saved_doc is not None
        assert saved_doc.get_encrypted_content() == test_content
        assert saved_doc.get_encrypted_title() == test_title

def test_create_document_invalid_session(test_app, test_client):
    test_content = {'content': 'test_content'}
    test_title = {'title': 'test_title'}
    
    response = test_client.post(
        '/api/sessions/nonexistent_session/documents',
        json={
            'encryptedContent': test_content,
            'encryptedTitle': test_title
        }
    )
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Session not found'

def test_create_document_missing_content(test_app, test_client, test_session):
    # Test without encrypted content
    response = test_client.post(
        f'/api/sessions/{test_session.address}/documents',
        json={
            'encryptedTitle': {'title': 'test_title'}
        }
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Missing encrypted content or title' in data['error']

def test_create_document_missing_title(test_app, test_client, test_session):
    # Test without encrypted title
    response = test_client.post(
        f'/api/sessions/{test_session.address}/documents',
        json={
            'encryptedContent': {'content': 'test_content'}
        }
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Missing encrypted content or title' in data['error']

def test_create_document_rate_limit(test_app, test_client, test_session):
    test_content = {'content': 'test_content'}
    test_title = {'title': 'test_title'}
    
    # Make 61 requests (limit is 60 per minute)
    for _ in range(61):
        response = test_client.post(
            f'/api/sessions/{test_session.address}/documents',
            json={
                'encryptedContent': test_content,
                'encryptedTitle': test_title
            }
        )
    
    assert response.status_code == 429
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Rate limit exceeded' in data['error']

def test_update_document_success(test_app, test_client, test_session):
    with test_app.app_context():
        # Create a test document
        doc = Document(
            document_url='test_doc_url',
            session_id=test_session.id
        )
        doc.set_encrypted_content({'content': 'original_content'})
        doc.set_encrypted_title({'title': 'original_title'})
        db.session.add(doc)
        db.session.commit()
        
        # Record the original modification time
        original_modified = doc.last_modified
        
        # Update the document
        new_content = {'content': 'updated_content'}
        new_title = {'title': 'updated_title'}
        
        response = test_client.put(
            f'/api/sessions/{test_session.address}/documents/{doc.document_url}',
            json={
                'encryptedContent': new_content,
                'encryptedTitle': new_title
            }
        )
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'data' in data
        
        # Verify response structure
        document = data['data']
        assert document['id'] == doc.document_url
        assert document['encryptedContent'] == new_content
        assert document['sessionId'] == test_session.address
        assert 'createdAt' in document
        assert 'lastModified' in document
        
        # Verify database update
        updated_doc = Document.query.filter_by(document_url=doc.document_url).first()
        assert updated_doc.get_encrypted_content() == new_content
        assert updated_doc.get_encrypted_title() == new_title
        assert updated_doc.last_modified > original_modified

# def test_update_document_content_only(test_app, test_client, test_session):
#     with test_app.app_context():
#         # Create a test document
#         doc = Document(
#             document_url='test_doc_url',
#             session_id=test_session.id
#         )
#         original_title = {'title': 'original_title'}
#         doc.set_encrypted_content({'content': 'original_content'})
#         doc.set_encrypted_title(original_title)
#         db.session.add(doc)
#         db.session.commit()
        
#         # Update only the content
#         new_content = {'content': 'updated_content'}
#         response = test_client.put(
#             f'/api/sessions/{test_session.address}/documents/{doc.document_url}',
#             json={
#                 'encryptedContent': new_content
#             }
#         )
#         assert response.status_code == 200
        
#         # Verify title remains unchanged
#         updated_doc = Document.query.filter_by(document_url=doc.document_url).first()
#         assert updated_doc.get_encrypted_content() == new_content
#         assert updated_doc.get_encrypted_title() == original_title

def test_update_document_invalid_session(test_app, test_client):
    response = test_client.put(
        '/api/sessions/nonexistent_session/documents/some_document',
        json={
            'encryptedContent': {'content': 'test_content'}
        }
    )
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Session not found'

def test_update_document_invalid_document(test_app, test_client, test_session):
    response = test_client.put(
        f'/api/sessions/{test_session.address}/documents/nonexistent_document',
        json={
            'encryptedContent': {'content': 'test_content'}
        }
    )
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Document not found'

def test_update_document_wrong_session(test_app, test_client, test_session):
    with test_app.app_context():
        # Create another session
        other_session = Session(
            address='other_session_address',
            salt='other_session_salt'
        )
        db.session.add(other_session)
        db.session.commit()
        
        # Create a document in the first session
        doc = Document(
            document_url='test_doc_url',
            session_id=test_session.id
        )
        doc.set_encrypted_content({'content': 'original_content'})
        doc.set_encrypted_title({'title': 'original_title'})
        db.session.add(doc)
        db.session.commit()
        
        # Try to update the document using the other session
        response = test_client.put(
            f'/api/sessions/{other_session.address}/documents/{doc.document_url}',
            json={
                'encryptedContent': {'content': 'updated_content'}
            }
        )
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Document not found'

def test_update_document_missing_content(test_app, test_client, test_session):
    with test_app.app_context():
        # Create a test document
        doc = Document(
            document_url='test_doc_url',
            session_id=test_session.id
        )
        doc.set_encrypted_content({'content': 'original_content'})
        doc.set_encrypted_title({'title': 'original_title'})
        db.session.add(doc)
        db.session.commit()
        
        # Try to update without content
        response = test_client.put(
            f'/api/sessions/{test_session.address}/documents/{doc.document_url}',
            json={}
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Missing encrypted content' in data['error']

def test_update_document_rate_limit(test_app, test_client, test_session):
    with test_app.app_context():
        # Create a test document
        doc = Document(
            document_url='test_doc_url',
            session_id=test_session.id
        )
        doc.set_encrypted_content({'content': 'original_content'})
        doc.set_encrypted_title({'title': 'original_title'})
        db.session.add(doc)
        db.session.commit()
        
        # Make 61 requests (limit is 60 per minute)
        for _ in range(61):
            response = test_client.put(
                f'/api/sessions/{test_session.address}/documents/{doc.document_url}',
                json={
                    'encryptedContent': {'content': 'updated_content'}
                }
            )
        
        assert response.status_code == 429
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Rate limit exceeded' in data['error']