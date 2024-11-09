import pytest
from datetime import datetime, timedelta
from api import Document, Session, db

def test_document_creation(test_app, test_session):
    with test_app.app_context():
        # Create a test document
        
        doc = Document(
            document_url='test_url',
            session_id=test_session.id
        )
        
        # Test encrypted content
        test_content = {'content': 'encrypted_test_content'}
        doc.set_encrypted_content(test_content)
        
        # Test encrypted title
        test_title = {'title': 'encrypted_test_title'}
        doc.set_encrypted_title(test_title)
        
        # Save to database
        db.session.add(doc)
        db.session.commit()
        
        # Retrieve and verify
        saved_doc = Document.query.filter_by(document_url='test_url').first()
        assert saved_doc is not None
        assert saved_doc.get_encrypted_content() == test_content
        assert saved_doc.get_encrypted_title() == test_title

def test_session_creation(test_app):
    with test_app.app_context():
        # Create a test session
        session = Session(
            address='test_address',
            salt='test_salt'
        )
        
        db.session.add(session)
        db.session.commit()
        
        # Retrieve and verify
        saved_session = Session.query.filter_by(address='test_address').first()
        assert saved_session is not None
        assert saved_session.salt == 'test_salt'
        assert isinstance(saved_session.created_at, datetime)
        assert isinstance(saved_session.last_accessed, datetime)

def test_session_document_relationship(test_app):
    with test_app.app_context():
        # Create a session
        session = Session(
            address='test_address_2',
            salt='test_salt_2'
        )
        db.session.add(session)
        db.session.commit()
        
        # Create multiple documents for the session
        doc1 = Document(
            document_url='test_url_1',
            session_id=session.id
        )
        doc1.set_encrypted_content({'content': 'test_content_1'})
        doc1.set_encrypted_title({'title': 'test_title_1'})
        
        doc2 = Document(
            document_url='test_url_2',
            session_id=session.id
        )
        doc2.set_encrypted_content({'content': 'test_content_2'})
        doc2.set_encrypted_title({'title': 'test_title_2'})
        
        db.session.add_all([doc1, doc2])
        db.session.commit()
        
        # Verify relationship
        saved_session = Session.query.filter_by(address='test_address_2').first()
        assert len(saved_session.documents) == 2
        assert any(doc.document_url == 'test_url_1' for doc in saved_session.documents)
        assert any(doc.document_url == 'test_url_2' for doc in saved_session.documents)

def test_document_timestamps(test_app, test_session):
    with test_app.app_context():
        # Create a document
        doc = Document(
            document_url='test_url_timestamps',
            session_id=test_session.id
        )
        doc.set_encrypted_content({'content': 'test_content'})
        doc.set_encrypted_title({'title': 'test_title'})
        
        db.session.add(doc)
        db.session.commit()
        
        # Verify timestamps
        assert isinstance(doc.created_at, datetime)
        assert isinstance(doc.last_modified, datetime)
        
        # Update document
        original_modified = doc.last_modified
        doc.set_encrypted_content({'content': 'updated_content'})
        db.session.commit()
        
        # Verify last_modified was updated
        assert doc.last_modified > original_modified

def test_document_json_serialization(test_app, test_session):
    with test_app.app_context():
        # Test complex JSON content
        test_content = {
            'content': 'test_content',
            'metadata': {
                'version': 1,
                'tags': ['test', 'json'],
                'numbers': [1, 2, 3]
            }
        }
        
        doc = Document(
            document_url='test_url_json',
            session_id=test_session.id
        )
        doc.set_encrypted_content(test_content)
        doc.set_encrypted_title({'title': 'test_json'})
        
        db.session.add(doc)
        db.session.commit()
        
        # Verify JSON serialization/deserialization
        saved_doc = Document.query.filter_by(document_url='test_url_json').first()
        assert saved_doc.get_encrypted_content() == test_content
        assert isinstance(saved_doc.get_encrypted_content()['metadata']['tags'], list)
        assert isinstance(saved_doc.get_encrypted_content()['metadata']['numbers'], list)