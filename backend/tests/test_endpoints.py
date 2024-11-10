import pytest
import json
from datetime import datetime
from api import app, db, Session, Document

@pytest.fixture
def test_app():
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/securenotes_test'
    app.config['TESTING'] = True
    
    with app.app_context():
        db.create_all()
        
    yield app
    
    with app.app_context():
        db.session.remove()
        db.drop_all()

@pytest.fixture
def test_client(test_app):
    return test_app.test_client()

@pytest.fixture
def test_session(test_app):
    with test_app.app_context():
        session = Session(address='test_address')
        db.session.add(session)
        db.session.commit()
        
        # Get the session ID before yielding
        session_id = session.id
        session_address = session.address
        
        yield session
        
        # Cleanup - delete documents first, then session
        db.session.query(Document).filter_by(session_id=session_id).delete()
        db.session.query(Session).filter_by(id=session_id).delete()
        db.session.commit()

def test_create_session_success(test_app, test_client):
    response = test_client.post(
        '/api/sessions',
        json={'address': 'test_address_1'}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    
    assert 'data' in data
    assert data['data']['id'] == 'test_address_1'
    assert 'createdAt' in data['data']
    assert 'lastAccessed' in data['data']

def test_create_session_missing_address(test_app, test_client):
    response = test_client.post('/api/sessions', json={})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['error'] == 'Address is required'

def test_validate_session_success(test_app, test_client, test_session):
    with test_app.app_context():
        response = test_client.get(f'/api/sessions/test_address')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'data' in data
        assert data['data']['id'] == 'test_address'

def test_validate_session_not_found(test_app, test_client):
    response = test_client.get('/api/sessions/nonexistent')
    assert response.status_code == 404

def test_get_documents_success(test_app, test_client, test_session):
    with test_app.app_context():
        # Create test documents
        for i in range(3):
            doc = Document(
                document_url=f'test_doc_{i}',
                encrypted_content='{"content": "test_content"}',
                encrypted_title='{"title": "test_title"}',
                session_id=db.session.query(Session).filter_by(address='test_address').first().id
            )
            db.session.add(doc)
        db.session.commit()
        
        response = test_client.get(f'/api/sessions/test_address/documents')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'data' in data
        assert 'documents' in data['data']
        assert len(data['data']['documents']) == 3

def test_create_document_success(test_app, test_client, test_session):
    doc_data = {
        'encryptedContent': '{"content": "test_content"}',
        'encryptedTitle': '{"title": "test_title"}'
    }
    
    response = test_client.post(
        f'/api/sessions/test_address/documents',
        json=doc_data
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    
    assert 'data' in data
    assert 'id' in data['data']
    assert 'encryptedContent' in data['data']
    assert 'encryptedTitle' in data['data']

def test_create_document_missing_fields(test_app, test_client, test_session):
    response = test_client.post(
        f'/api/sessions/test_address/documents',
        json={}
    )
    assert response.status_code == 400

def test_update_document_success(test_app, test_client, test_session):
    with test_app.app_context():
        # Get fresh session from database
        session = db.session.query(Session).filter_by(address='test_address').first()
        
        # Create a test document
        doc = Document(
            document_url='test_doc_url',
            encrypted_content='{"content": "original_content"}',
            encrypted_title='{"title": "original_title"}',
            session_id=session.id
        )
        db.session.add(doc)
        db.session.commit()
        
        # Update the document
        update_data = {
            'encryptedContent': '{"content": "updated_content"}',
            'encryptedTitle': '{"title": "updated_title"}'
        }
        
        response = test_client.put(
            f'/api/sessions/test_address/documents/test_doc_url',
            json=update_data
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['data']['encryptedContent'] == update_data['encryptedContent']
        assert data['data']['encryptedTitle'] == update_data['encryptedTitle']

def test_delete_document_success(test_app, test_client, test_session):
    with test_app.app_context():
        # Get fresh session from database
        session = db.session.query(Session).filter_by(address='test_address').first()
        
        # Create a test document
        doc = Document(
            document_url='test_doc_url',
            encrypted_content='{"content": "test_content"}',
            encrypted_title='{"title": "test_title"}',
            session_id=session.id
        )
        db.session.add(doc)
        db.session.commit()
        
        # Delete the document
        response = test_client.delete(
            f'/api/sessions/test_address/documents/test_doc_url'
        )
        
        assert response.status_code == 200
        
        # Verify document is deleted
        doc = Document.query.filter_by(document_url='test_doc_url').first()
        assert doc is None

def test_pagination(test_app, test_client, test_session):
    with test_app.app_context():
        # Get fresh session from database
        session = db.session.query(Session).filter_by(address='test_address').first()
        
        # Create 15 test documents
        for i in range(15):
            doc = Document(
                document_url=f'test_doc_{i}',
                encrypted_content='{"content": "test_content"}',
                encrypted_title='{"title": "test_title"}',
                session_id=session.id
            )
            db.session.add(doc)
        db.session.commit()
        
        # Test first page
        response = test_client.get(f'/api/sessions/test_address/documents?page=1')
        data = json.loads(response.data)
        assert len(data['data']['documents']) == 10
        assert data['data']['total'] == 15
        assert data['data']['pages'] == 2
        
        # Test second page
        response = test_client.get(f'/api/sessions/test_address/documents?page=2')
        data = json.loads(response.data)
        assert len(data['data']['documents']) == 5