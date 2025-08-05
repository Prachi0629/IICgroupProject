import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import uuid

# --- APP SETUP ---
# This configuration tells Flask to serve files from the current directory.
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app) # Enable Cross-Origin Resource Sharing

# --- DATABASE CONFIGURATION ---
# This sets up a simple file-based SQLite database named 'conference.db'.
# It will be automatically created in the same folder when you run the app.
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///conference.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- DATABASE MODELS (The blueprint for your data tables) ---
class Attendee(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    type = db.Column(db.String(50), nullable=False) # e.g., 'Presenter', 'Member'
    qr_code_token = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    food_scans = db.relationship('FoodScan', backref='attendee', lazy=True, cascade="all, delete-orphan")
    attendance_logs = db.relationship('AttendanceLog', backref='attendee', lazy=True, cascade="all, delete-orphan")

class FoodScan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    attendee_id = db.Column(db.String(36), db.ForeignKey('attendee.id'), nullable=False)
    meal_type = db.Column(db.String(50), nullable=False) # e.g., 'Day1-Breakfast'
    scan_time = db.Column(db.DateTime, default=datetime.utcnow)

class AttendanceLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    attendee_id = db.Column(db.String(36), db.ForeignKey('attendee.id'), nullable=False)
    session_id = db.Column(db.String(50), nullable=False) # e.g., 'Room1-AI'
    scan_time = db.Column(db.DateTime, default=datetime.utcnow)

class Committee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False) # In production, use a secure hash
    designation = db.Column(db.String(100))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), unique=True, nullable=False)
    permissions = db.Column(db.Text) # JSON string defining access rights
    members = db.relationship('Committee', backref='role', lazy=True)

# --- WEB PAGE ROUTE ---
# This is the main entry point for the frontend.
@app.route('/')
def admin_dashboard():
    # It finds and serves the 'admin.html' file.
    return send_from_directory('.', 'admin.html')

# --- API ENDPOINTS (The "brain" of the application) ---

# Endpoint for food scanning
@app.route('/api/scan/food', methods=['POST'])
def scan_food():
    data = request.json
    token, meal_type = data.get('qr_code_token'), data.get('meal_type')
    attendee = Attendee.query.filter_by(qr_code_token=token).first()
    if not attendee: return jsonify({'status': 'error', 'message': 'Invalid QR Code'}), 404
    
    # Check if already scanned for this specific meal
    if FoodScan.query.filter_by(attendee_id=attendee.id, meal_type=meal_type).first():
        return jsonify({'status': 'error', 'message': f'Already Scanned for {meal_type}'}), 409
    
    # Check total food scan limit
    if len(attendee.food_scans) >= 6: return jsonify({'status': 'error', 'message': 'Food Pass Limit Reached (6 Scans)'}), 403
    
    db.session.add(FoodScan(attendee_id=attendee.id, meal_type=meal_type))
    db.session.commit()
    return jsonify({'status': 'success', 'message': f'Food Pass Verified for {attendee.name}'}), 200

# Endpoint for attendance scanning
@app.route('/api/scan/attendance', methods=['POST'])
def scan_attendance():
    data = request.json
    token, session_id = data.get('qr_code_token'), data.get('session_id')
    attendee = Attendee.query.filter_by(qr_code_token=token).first()
    if not attendee: return jsonify({'status': 'error', 'message': 'Invalid QR Code'}), 404
    
    # Check if already checked in for this session
    if AttendanceLog.query.filter_by(attendee_id=attendee.id, session_id=session_id).first():
        return jsonify({'status': 'error', 'message': f'Already Checked-In to {session_id}'}), 409
    
    db.session.add(AttendanceLog(attendee_id=attendee.id, session_id=session_id))
    db.session.commit()
    return jsonify({'status': 'success', 'message': f'Attendance Marked for {attendee.name}'}), 200

# Endpoint to add a new attendee
@app.route('/api/attendees', methods=['POST'])
def add_attendee():
    data = request.json
    new_attendee = Attendee(name=data['name'], email=data['email'], type=data['type'])
    db.session.add(new_attendee)
    db.session.commit()
    return jsonify({'message': 'Attendee added', 'qr_code_token': new_attendee.qr_code_token}), 201

# Endpoint to get all attendees
@app.route('/api/attendees', methods=['GET'])
def get_attendees():
    attendees = Attendee.query.all()
    return jsonify([{'id': a.id, 'name': a.name, 'email': a.email, 'type': a.type, 'qr_code_token': a.qr_code_token} for a in attendees])

# Endpoint for dashboard analytics
@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics():
    session_counts = db.session.query(AttendanceLog.session_id, db.func.count(AttendanceLog.session_id)).group_by(AttendanceLog.session_id).all()
    return jsonify({
        'total_attendees': Attendee.query.count(),
        'total_checkins': AttendanceLog.query.count(),
        'total_food_scans': FoodScan.query.count(),
        'session_attendance': {session: count for session, count in session_counts}
    })

# --- INITIAL DATABASE SETUP ---
# This function runs once when the server starts to create the database and default users.
def setup_database(app):
    with app.app_context():
        db.create_all()
        # Create a default Admin role if it doesn't exist
        if not Role.query.filter_by(role_name='Admin').first():
            db.session.add(Role(role_name='Admin', permissions=json.dumps(['all'])))
            db.session.commit()
        # Create a default Admin user if it doesn't exist
        if not Committee.query.filter_by(email='admin@conference.com').first():
            db.session.add(Committee(name='Admin User', email='admin@conference.com', password_hash='admin123', designation='System Administrator', role_id=1))
            db.session.commit()

# --- RUN THE FLASK APP ---
if __name__ == '__main__':
    setup_database(app)
    app.run(debug=True, port=5000)
