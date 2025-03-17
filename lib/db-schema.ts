// This file represents the database schema for the CV analysis system
// It's not used in the frontend code but serves as documentation

/*
Database Schema for CV Analysis System

1. Candidates Table
   - id: string (primary key)
   - candidateName: string
   - experienceLevel: string (enum)
   - primaryDepartment: string
   - overallScore: number
   - dateAnalyzed: date
   - cvUrl: string (path to stored CV file)
   - scoreComponents: jsonb
   - personalAttributes: jsonb
   - createdAt: timestamp
   - updatedAt: timestamp

2. DepartmentScores Table
   - id: string (primary key)
   - candidateId: string (foreign key)
   - category: string (enum)
   - department: string
   - score: number
   - createdAt: timestamp
   - updatedAt: timestamp

3. Skills Table
   - id: string (primary key)
   - candidateId: string (foreign key)
   - category: string (enum)
   - name: string
   - level: number
   - createdAt: timestamp
   - updatedAt: timestamp

4. Languages Table
   - id: string (primary key)
   - candidateId: string (foreign key)
   - language: string
   - level: number
   - createdAt: timestamp
   - updatedAt: timestamp

5. Certifications Table
   - id: string (primary key)
   - candidateId: string (foreign key)
   - name: string
   - issuer: string
   - expiryDate: date (nullable)
   - createdAt: timestamp
   - updatedAt: timestamp

6. RecommendedPositions Table
   - id: string (primary key)
   - candidateId: string (foreign key)
   - title: string
   - department: string
   - matchScore: number
   - createdAt: timestamp
   - updatedAt: timestamp

7. Tags Table
   - id: string (primary key)
   - candidateId: string (foreign key)
   - tag: string
   - createdAt: timestamp
   - updatedAt: timestamp

Indexes:
- candidates(overallScore)
- candidates(experienceLevel)
- candidates(primaryDepartment)
- candidates(dateAnalyzed)
- departmentScores(candidateId)
- departmentScores(department, score)
- skills(candidateId)
- skills(name, level)
- tags(candidateId)
- tags(tag)

This schema supports efficient querying for the dashboard's search and filter functionality.
*/

