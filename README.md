# Realtime Chat App (React Native + Spring Boot)

A mobile full-stack realtime chat application built with **React Native + Expo** and **Java Spring Boot**.

It supports:
- Instant messaging via WebSockets (STOMP Protocol)
- Video calls powered by WebRTC  
- Cloud storage for images with Azure Blob Storage  
- CI/CD pipeline using GitHub Actions and Render deployment  
- Neon PostgreSQL database

> **Note:** This project is currently in beta – some features may still be unstable or in active development.

## Tech Highlights

**Frontend (React Native + Expo)**  
- Realtime chat UI with instant message updates
- User presence (online/offline/last seen)
- WebRTC for video calls  
- Image uploads handled via Azure Blob Storage to reduce Neon db load
- Handles live WebSocket/STOMP connections with reconnection supported  

**Backend (Java Spring Boot)**  
- REST API for authentication, user management, and message storage  
- Realtime messaging using WebSocket with STOMP over SockJS  
- Video call signaling for WebRTC sessions  
- Image upload integrated with Azure Blob Storage  
- Database: PostgreSQL (Neon) on production
- CI/CD supporting Render deployment  

## Features
- Realtime one-on-one chat using WebSockets  
- Video call functionality with WebRTC  
- Profile picture uploads   
- Authentication and user management  
- CI/CD pipeline for automated deployment  

## Planned Features
- AI message enhancements
- Message reactions and replies
- End-to-end encryption
- Sending images via messages

## Getting Started

Coming soon... as well as preview of the project
