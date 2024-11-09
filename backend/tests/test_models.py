import pytest
from api import Document, db

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