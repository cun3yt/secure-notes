import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from api import app, db, Document, Session
from dotenv import load_dotenv

@pytest.fixture
def test_app():
    # Configure app for testing
    flask_env = os.getenv('FLASK_ENV')
    
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), f'.env.{flask_env}.local'))
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['TESTING'] = True
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    yield app
    
    # Cleanup after tests
    with app.app_context():
        db.session.remove()
        db.drop_all()

@pytest.fixture
def test_client(test_app):
    return test_app.test_client()

@pytest.fixture
def test_session(test_app):
    with test_app.app_context():
        session = Session(
            address='test_session_address',
            salt='test_session_salt'
        )
        db.session.add(session)
        db.session.commit()
        
        # Get a fresh copy of the session that's bound to the current db session
        session = db.session.get(Session, session.id)
        return session

@pytest.fixture(autouse=True)
def reset_rate_limits(test_app):
    """Reset rate limits before each test"""
    from api import limiter
    with test_app.app_context():
        limiter.reset()