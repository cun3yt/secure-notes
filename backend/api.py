from flask import Flask, jsonify, request
from flask_migrate import Migrate
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import uuid

app = Flask(__name__)
CORS(app)

# Configure rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/securenotes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Models
class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(64), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    documents = db.relationship('Document', backref='session', lazy=True)

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    document_url = db.Column(db.String(256), unique=True, nullable=False)
    encrypted_content = db.Column(db.Text, nullable=False)
    encrypted_title = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_modified = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=False)

# Session routes
@app.route('/api/sessions', methods=['POST'])
@limiter.limit("5 per minute")
def create_session():
    data = request.get_json()
    address = data.get('address')
    
    if not address:
        return jsonify({'error': 'Address is required'}), 400
        
    session = Session(address=address)
    db.session.add(session)
    
    try:
        db.session.commit()
        return jsonify({
            'data': {
                'id': session.address,
                'createdAt': session.created_at.isoformat(),
                'lastAccessed': session.last_accessed.isoformat()
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create session'}), 500

@app.route('/api/sessions/<address>', methods=['GET'])
@limiter.limit("60 per minute")
def validate_session(address):
    session = Session.query.filter_by(address=address).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
        
    session.last_accessed = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'data': {
            'id': session.address,
            'createdAt': session.created_at.isoformat(),
            'lastAccessed': session.last_accessed.isoformat()
        }
    })

# Document routes
@app.route('/api/sessions/<address>/documents', methods=['GET'])
@limiter.limit("60 per minute")
def get_documents(address):
    session = Session.query.filter_by(address=address).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    documents = Document.query.filter_by(session_id=session.id)\
        .order_by(Document.last_modified.desc())\
        .paginate(page=page, per_page=per_page)
    
    return jsonify({
        'data': {
            'documents': [{
                'id': doc.document_url,
                'encryptedTitle': doc.encrypted_title,
                'encryptedContent': doc.encrypted_content,
                'createdAt': doc.created_at.isoformat(),
                'lastModified': doc.last_modified.isoformat()
            } for doc in documents.items],
            'total': documents.total,
            'pages': documents.pages,
            'currentPage': documents.page
        }
    })

@app.route('/api/sessions/<address>/documents', methods=['POST'])
@limiter.limit("60 per minute")
def create_document(address):
    session = Session.query.filter_by(address=address).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    data = request.get_json()
    if not data or 'encryptedContent' not in data or 'encryptedTitle' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Generate unique document URL (you might want to implement a more secure method)
    document_url = str(uuid.uuid4())
    
    document = Document(
        document_url=document_url,
        encrypted_content=data['encryptedContent'],
        encrypted_title=data['encryptedTitle'],
        session_id=session.id
    )
    
    try:
        db.session.add(document)
        db.session.commit()
        return jsonify({
            'data': {
                'id': document.document_url,
                'encryptedTitle': document.encrypted_title,
                'encryptedContent': document.encrypted_content,
                'createdAt': document.created_at.isoformat(),
                'lastModified': document.last_modified.isoformat()
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create document'}), 500

@app.route('/api/sessions/<address>/documents/<document_url>', methods=['GET'])
@limiter.limit("60 per minute")
def get_document(address, document_url):
    session = Session.query.filter_by(address=address).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    document = Document.query.filter_by(session_id=session.id, document_url=document_url).first()
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    return jsonify({
        'data': {
            'id': document.document_url,
            'encryptedTitle': document.encrypted_title,
            'encryptedContent': document.encrypted_content,
            'createdAt': document.created_at.isoformat(),
            'lastModified': document.last_modified.isoformat()
        }
    })

@app.route('/api/sessions/<address>/documents/<document_url>', methods=['PUT'])
@limiter.limit("60 per minute")
def update_document(address, document_url):
    session = Session.query.filter_by(address=address).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    document = Document.query.filter_by(session_id=session.id, document_url=document_url).first()
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'encryptedContent' in data:
        document.encrypted_content = data['encryptedContent']
    if 'encryptedTitle' in data:
        document.encrypted_title = data['encryptedTitle']
    
    document.last_modified = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'data': {
                'id': document.document_url,
                'encryptedTitle': document.encrypted_title,
                'encryptedContent': document.encrypted_content,
                'createdAt': document.created_at.isoformat(),
                'lastModified': document.last_modified.isoformat()
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update document'}), 500

@app.route('/api/sessions/<address>/documents/<document_url>', methods=['DELETE'])
@limiter.limit("60 per minute")
def delete_document(address, document_url):
    session = Session.query.filter_by(address=address).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    document = Document.query.filter_by(session_id=session.id, document_url=document_url).first()
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    try:
        db.session.delete(document)
        db.session.commit()
        return jsonify({
            'data': {
                'message': 'Document deleted successfully'
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete document'}), 500

if __name__ == '__main__':
    app.run(debug=True)