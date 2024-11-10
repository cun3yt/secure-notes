import pytest
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
def test_session(test_app):
    with test_app.app_context():
        session = Session(address='test_session_address')
        db.session.add(session)
        db.session.commit()
        
        # Get the session ID before yielding
        session_id = session.id
        
        yield session_id  # Return just the ID instead of the session object
        
        # Cleanup
        db.session.query(Document).filter_by(session_id=session_id).delete()
        db.session.query(Session).filter_by(id=session_id).delete()
        db.session.commit()

def test_session_creation(test_app):
    with test_app.app_context():
        # Create a test session
        session = Session(address='test_address')
        
        db.session.add(session)
        db.session.commit()
        
        # Retrieve and verify
        saved_session = Session.query.filter_by(address='test_address').first()
        assert saved_session is not None
        assert saved_session.address == 'test_address'
        assert isinstance(saved_session.created_at, datetime)
        assert isinstance(saved_session.last_accessed, datetime)

def test_session_document_relationship(test_app):
    with test_app.app_context():
        # Create a session
        session = Session(address='test_address_2')
        db.session.add(session)
        db.session.commit()
        
        # Create documents for the session
        doc1 = Document(
            document_url='test_doc_1',
            encrypted_content='{"content": "test_content_1"}',
            encrypted_title='{"title": "test_title_1"}',
            session_id=session.id
        )
        doc2 = Document(
            document_url='test_doc_2',
            encrypted_content='{"content": "test_content_2"}',
            encrypted_title='{"title": "test_title_2"}',
            session_id=session.id
        )
        
        db.session.add_all([doc1, doc2])
        db.session.commit()
        
        # Refresh the session to get updated relationships
        db.session.refresh(session)
        
        # Test relationship
        assert len(session.documents) == 2
        assert session.documents[0].encrypted_content == '{"content": "test_content_1"}'
        assert session.documents[1].encrypted_content == '{"content": "test_content_2"}'

def test_document_creation(test_app, test_session):
    with test_app.app_context():
        # Get fresh session from database
        session = db.session.query(Session).get(test_session)
        
        # Create a test document
        doc = Document(
            document_url='test_doc',
            encrypted_content='{"content": "test_content"}',
            encrypted_title='{"title": "test_title"}',
            session_id=session.id
        )
        
        db.session.add(doc)
        db.session.commit()
        
        # Retrieve and verify
        saved_doc = Document.query.filter_by(document_url='test_doc').first()
        assert saved_doc is not None
        assert saved_doc.encrypted_content == '{"content": "test_content"}'
        assert saved_doc.encrypted_title == '{"title": "test_title"}'
        assert saved_doc.session_id == session.id

def test_document_timestamps(test_app, test_session):
    with test_app.app_context():
        # Get fresh session from database
        session = db.session.query(Session).get(test_session)
        
        # Create a document
        doc = Document(
            document_url='test_doc_timestamps',
            encrypted_content='{"content": "original"}',
            encrypted_title='{"title": "original"}',
            session_id=session.id
        )
        
        db.session.add(doc)
        db.session.commit()
        
        creation_time = doc.created_at
        original_modified = doc.last_modified
        
        # Update document
        doc.encrypted_content = '{"content": "updated"}'
        db.session.commit()
        
        # Verify timestamps
        assert doc.created_at == creation_time
        assert doc.last_modified > original_modified

def test_document_json_serialization(test_app, test_session):
    with test_app.app_context():
        # Get fresh session from database
        session = db.session.query(Session).get(test_session)
        
        doc = Document(
            document_url='test_doc_json',
            encrypted_content='{"content": "test"}',
            encrypted_title='{"title": "test"}',
            session_id=session.id
        )
        
        db.session.add(doc)
        db.session.commit()
        
        # Verify JSON serialization
        doc_dict = {
            'id': doc.document_url,
            'encryptedContent': doc.encrypted_content,
            'encryptedTitle': doc.encrypted_title,
            'createdAt': doc.created_at.isoformat(),
            'lastModified': doc.last_modified.isoformat()
        }
        
        assert isinstance(doc_dict['createdAt'], str)
        assert isinstance(doc_dict['lastModified'], str)
        assert doc_dict['encryptedContent'] == '{"content": "test"}'
        assert doc_dict['encryptedTitle'] == '{"title": "test"}'