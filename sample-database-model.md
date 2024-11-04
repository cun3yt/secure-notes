# Database Model

## Sessions

This table stores session-related information. Each session is identified by an address derived from the cryptographic key.

```sql
CREATE TABLE Sessions (
    session_id SERIAL PRIMARY KEY,
    address VARCHAR(64) UNIQUE NOT NULL, -- Address derived from the session's encryption key
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Documents

This table stores encrypted documents associated with a session.

```sql
CREATE TABLE Documents (
    document_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES Sessions(session_id),
    document_url VARCHAR(256) UNIQUE NOT NULL, -- Unique and hard-to-guess URL
    encrypted_content TEXT NOT NULL, -- The encrypted content of the document
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

As you can see, the documents are associated with a session. The session is identified by an address derived from the cryptographic key. The document URL is a unique and hard-to-guess URL. The encrypted content is the actual content of the document. Also, there is a one-to-many relationship between sessions and documents. One session can have multiple documents, but each document belongs to a single session.
