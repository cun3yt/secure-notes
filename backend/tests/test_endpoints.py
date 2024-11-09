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