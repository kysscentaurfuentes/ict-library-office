:: ICT-LIBRARY-OFFICE/backup-database.bat
@echo off

set BACKUP_DIR=database_backups

set FILE_NAME=ict_backup_%date:~10,4%-%date:~4,2%-%date:~7,2%_%time:~0,2%-%time:~3,2%.sql

docker exec -t ict-postgres pg_dump -U postgres ict_library_db > %BACKUP_DIR%\%FILE_NAME%

echo Backup completed:
echo %BACKUP_DIR%\%FILE_NAME%