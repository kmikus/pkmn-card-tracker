# Production Deployment Checklist

## Overview
This document tracks the deployment of the database restructuring changes to production, including:
- Database schema migration (new `cards` and `user_collection` tables)
- Population of 19,500+ cards from Pokemon TCG API
- Code changes for new data structure
- localStorage optimization for guest users

## Pre-Deployment Checklist ✅

### Code Changes Ready
- [x] Database schema updated (`cards`, `user_collection` tables)
- [x] Backend services updated (`CollectionService`, `TagService`)
- [x] API routes updated for new structure
- [x] Frontend types and components updated
- [x] localStorage optimization implemented
- [x] Logout functionality fixed
- [x] All changes tested in development environment

### Database Migration Scripts Ready
- [x] Prisma migration files created
- [x] TCG API population script ready (`npm run populate-cards`)
- [x] Backup scripts available (`server/db-scripts/backup-prod-docker.sh`)
- [x] Restore scripts available (`server/db-scripts/restore-to-dev-docker.sh`)

## Production Deployment Steps

### Phase 1: Pre-Migration Safety (Estimated: 30 minutes)

#### 1.1 Stop Production Application
- [ ] **Stop the production application** to prevent new data from being written
- [ ] **Verify application is down** by checking the production URL
- [ ] **Note the timestamp** when the app was stopped

#### 1.2 Create Production Database Backup
- [ ] **Run backup script**: `./server/db-scripts/backup-prod-docker.sh`
- [ ] **Verify backup file** was created and has reasonable size
- [ ] **Test backup integrity** by attempting to restore to a test environment
- [ ] **Store backup securely** (multiple locations recommended)

#### 1.3 Document Current State
- [ ] **Record current database size** and table counts
- [ ] **Note any active users** or recent activity
- [ ] **Document current environment variables** (without sensitive data)

### Phase 2: Database Migration (Estimated: 45 minutes)

#### 2.1 Apply Prisma Migrations
- [ ] **Connect to production database** using production credentials
- [ ] **Run migration**: `npx prisma migrate deploy`
- [ ] **Verify migration success** by checking migration status
- [ ] **Validate schema changes** in production database

#### 2.2 Populate Cards Table
- [ ] **Run TCG API population script**: `npm run populate-cards`
- [ ] **Monitor progress** (expect ~19,500 cards from 168 sets)
- [ ] **Verify data quality** by checking sample cards
- [ ] **Confirm all sets populated** correctly

#### 2.3 Validate Migration Results
- [ ] **Check table counts**:
  - `cards` table: ~19,500 records
  - `user_collection` table: should be empty (new table)
  - `collection` table: should have existing user data
  - `card_tags` table: should have existing tag data
- [ ] **Verify foreign key relationships** are intact
- [ ] **Test sample queries** to ensure data integrity

### Phase 3: Code Deployment (Estimated: 30 minutes)

#### 3.1 Deploy Backend Changes
- [ ] **Merge feature branch to master**
- [ ] **Trigger backend deployment**
- [ ] **Monitor deployment logs** for any errors
- [ ] **Verify backend starts successfully**

#### 3.2 Deploy Frontend Changes
- [ ] **Trigger frontend deployment**
- [ ] **Monitor deployment logs** for any errors
- [ ] **Verify frontend builds successfully**

#### 3.3 Post-Deployment Validation
- [ ] **Test authentication flow** (Google OAuth)
- [ ] **Test collection operations** (add/remove cards)
- [ ] **Test tag operations** (favorite/wishlist)
- [ ] **Test guest user functionality** (localStorage)
- [ ] **Verify logout functionality** works correctly

### Phase 4: Production Testing (Estimated: 60 minutes)

#### 4.1 Functional Testing
- [ ] **Test user registration/login** with Google OAuth
- [ ] **Test adding cards to collection** (authenticated users)
- [ ] **Test removing cards from collection**
- [ ] **Test favorite/wishlist functionality**
- [ ] **Test guest user experience** (localStorage)
- [ ] **Test logout and session management**

#### 4.2 Data Integrity Testing
- [ ] **Verify existing user collections** are preserved
- [ ] **Verify existing tags** are preserved
- [ ] **Test collection display** shows correct data
- [ ] **Verify card images** load correctly
- [ ] **Test search and filtering** functionality

#### 4.3 Performance Testing
- [ ] **Monitor database query performance**
- [ ] **Check application response times**
- [ ] **Monitor memory usage**
- [ ] **Verify no memory leaks** in production

### Phase 5: Monitoring & Rollback Plan (Ongoing)

#### 5.1 Monitoring Setup
- [ ] **Set up error monitoring** for the application
- [ ] **Monitor database performance** metrics
- [ ] **Set up alerts** for critical errors
- [ ] **Monitor user activity** and feedback

#### 5.2 Rollback Plan
If issues are discovered:
1. **Stop the application**
2. **Restore database** from backup: `./server/db-scripts/restore-to-dev-docker.sh`
3. **Revert code** to previous version
4. **Redeploy** previous version
5. **Investigate issues** in development environment

## Risk Mitigation

### High-Risk Scenarios
- **Database migration fails**: Use backup to restore
- **TCG API population fails**: Retry with exponential backoff
- **Code deployment fails**: Rollback to previous version
- **Data corruption**: Restore from backup

### Rollback Triggers
- **User reports data loss**
- **Application errors > 5%**
- **Performance degradation > 50%**
- **Critical functionality broken**

## Success Criteria

### Technical Success
- [ ] All database migrations completed successfully
- [ ] 19,500+ cards populated from TCG API
- [ ] Existing user data preserved
- [ ] Application starts without errors
- [ ] All functionality works as expected

### User Experience Success
- [ ] Users can log in without issues
- [ ] Collections display correctly
- [ ] Tag functionality works
- [ ] Guest users can use localStorage
- [ ] No data loss reported

## Post-Deployment Tasks

### Cleanup
- [ ] **Remove old `collection` table** (after confirming no issues)
- [ ] **Clean up migration files** if needed
- [ ] **Update documentation** with new schema

### Monitoring
- [ ] **Monitor for 24-48 hours** after deployment
- [ ] **Check user feedback** and support requests
- [ ] **Monitor performance metrics**
- [ ] **Address any issues** that arise

## Contact Information

### Emergency Contacts
- **Database Admin**: [Add contact info]
- **DevOps**: [Add contact info]
- **Lead Developer**: [Add contact info]

### Communication Plan
- **Status updates**: Every 30 minutes during deployment
- **Issue escalation**: Immediate notification for critical issues
- **User communication**: Inform users of maintenance window

---

**Last Updated**: [Date]
**Deployment Lead**: [Name]
**Estimated Total Time**: 2.5 hours
**Risk Level**: Medium (database migration with backup) 