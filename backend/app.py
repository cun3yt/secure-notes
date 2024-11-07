from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})  # Enable CORS for all routes

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/securenotes')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Models
class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(64), unique=True, nullable=False)
    salt = db.Column(db.String(32), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    documents = db.relationship('Document', backref='session', lazy=True)

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    document_url = db.Column(db.String(256), unique=True, nullable=False)
    encrypted_content = db.Column(db.Text, nullable=False)
    encrypted_title = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_modified = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)

    def set_encrypted_content(self, content_dict):
        self.encrypted_content = json.dumps(content_dict)

    def get_encrypted_content(self):
        return json.loads(self.encrypted_content)

    def set_encrypted_title(self, title_dict):
        self.encrypted_title = json.dumps(title_dict)

    def get_encrypted_title(self):
        return json.loads(self.encrypted_title)

# Routes
@app.route('/api/sessions/<session_id>/documents', methods=['GET'])
def get_documents(session_id):
    print(f"Getting documents for session: {session_id}")  # Debug log
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    session = Session.query.filter_by(address=session_id).first()
    if not session:
        print(f"Session not found: {session_id}")  # Debug log
        return jsonify({'error': 'Session not found'}), 404
    
    try:
        check_session_valid(session)
    except Exception as e:
        print(f"Session validation failed: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 401
    
    # Update last accessed time
    session.last_accessed = datetime.utcnow()
    db.session.commit()
    
    # Get paginated documents
    pagination = Document.query.filter_by(session_id=session.id)\
        .order_by(Document.last_modified.desc())\
        .paginate(page=page, per_page=per_page)
    
    documents = [{
        'id': doc.document_url,
        'encryptedTitle': doc.get_encrypted_title(),
        'createdAt': doc.created_at.isoformat(),
        'lastModified': doc.last_modified.isoformat(),
        'sessionId': session_id
    } for doc in pagination.items]
    
    print(f"Found {len(documents)} documents")  # Debug log
    print(f"Total documents: {pagination.total}")  # Debug log
    
    return jsonify({
        'data': {
            'documents': documents,
            'total': pagination.total
        }
    })

@app.route('/api/sessions/<session_id>/documents/<document_id>', methods=['GET'])
def get_document(session_id, document_id):
    session = Session.query.filter_by(address=session_id).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    document = Document.query.filter_by(session_id=session.id, document_url=document_id).first()
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    return jsonify({
        'data': {
            'id': document.document_url,
            'encryptedContent': document.get_encrypted_content(),
            'sessionId': session_id,
            'createdAt': document.created_at.isoformat(),
            'lastModified': document.last_modified.isoformat()
        }
    })

@app.route('/api/sessions/<session_id>/documents', methods=['POST'])
def create_document(session_id):
    session = Session.query.filter_by(address=session_id).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    data = request.get_json()
    if not data or 'encryptedContent' not in data or 'encryptedTitle' not in data:
        return jsonify({'error': 'Missing encrypted content or title'}), 400
    
    # Generate unique document URL
    document_url = os.urandom(32).hex()
    
    document = Document(
        document_url=document_url,
        session_id=session.id
    )
    document.set_encrypted_content(data['encryptedContent'])
    document.set_encrypted_title(data['encryptedTitle'])
    
    try:
        db.session.add(document)
        db.session.commit()
        
        return jsonify({
            'data': {
                'id': document.document_url,
                'encryptedContent': document.get_encrypted_content(),
                'encryptedTitle': document.get_encrypted_title(),
                'sessionId': session_id,
                'createdAt': document.created_at.isoformat(),
                'lastModified': document.last_modified.isoformat()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        print('Error creating document:', e)
        return jsonify({'error': 'Failed to create document'}), 500

@app.route('/api/sessions/<session_id>/documents/<document_id>', methods=['PUT'])
def update_document(session_id, document_id):
    session = Session.query.filter_by(address=session_id).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    document = Document.query.filter_by(session_id=session.id, document_url=document_id).first()
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    data = request.get_json()
    if not data or 'encryptedContent' not in data:
        return jsonify({'error': 'Missing encrypted content'}), 400
    
    document.set_encrypted_content(data['encryptedContent'])
    document.last_modified = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'data': {
            'id': document.document_url,
            'encryptedContent': document.get_encrypted_content(),
            'sessionId': session_id,
            'createdAt': document.created_at.isoformat(),
            'lastModified': document.last_modified.isoformat()
        }
    })

# Session routes
@app.route('/api/sessions', methods=['POST'])
def create_session():
    data = request.get_json()
    if not data or 'address' not in data or 'salt' not in data:
        return jsonify({'error': 'Missing session address or salt'}), 400
    
    # Create new session with salt
    session = Session(
        address=data['address'],
        salt=data['salt']
    )
    
    try:
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'data': {
                'id': session.address,
                'salt': session.salt,
                'createdAt': session.created_at.isoformat(),
                'lastAccessed': session.last_accessed.isoformat()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create session'}), 500

@app.route('/api/sessions/<session_id>', methods=['GET'])
def validate_session(session_id):
    session = Session.query.filter_by(address=session_id).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # Check if session has expired (12 hours)
    session_age = datetime.utcnow() - session.created_at
    if session_age.total_seconds() > 12 * 60 * 60:  # 12 hours in seconds
        return jsonify({'error': 'Session expired'}), 401
    
    # Update last accessed time
    session.last_accessed = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'data': {
            'id': session.address,
            'salt': session.salt,
            'createdAt': session.created_at.isoformat(),
            'lastAccessed': session.last_accessed.isoformat()
        }
    })

@app.route('/api/sessions/<session_id>', methods=['DELETE'])
def end_session(session_id):
    session = Session.query.filter_by(address=session_id).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    try:
        # Just update last_accessed time instead of deleting
        session.last_accessed = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'data': {
                'message': 'Session ended successfully'
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to end session'}), 500

# Update existing document routes to check session expiry
def check_session_valid(session):
    session_age = datetime.utcnow() - session.created_at
    if session_age.total_seconds() > 12 * 60 * 60:
        raise Exception('Session expired')

if __name__ == '__main__':
    app.run(debug=True) 