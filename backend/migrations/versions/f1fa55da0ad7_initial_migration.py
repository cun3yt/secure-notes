"""Initial migration

Revision ID: f1fa55da0ad7
Revises: 
Create Date: 2024-11-04 20:20:22.333628

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f1fa55da0ad7'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('sessions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('address', sa.String(length=64), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('last_accessed', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('address')
    )
    op.create_table('documents',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('document_url', sa.String(length=256), nullable=False),
    sa.Column('encrypted_content', sa.Text(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('last_modified', sa.DateTime(), nullable=True),
    sa.Column('session_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('document_url')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('documents')
    op.drop_table('sessions')
    # ### end Alembic commands ###
