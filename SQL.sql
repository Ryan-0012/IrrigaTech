CREATE DATABASE [IrrigaBD]

GO

USE [IrrigaBD]

GO

CREATE SCHEMA [aggregate]

GO

CREATE TYPE [dbo].[AccountType] AS TABLE(
	[Username] [varchar](20) NOT NULL,
	[NormalizedUsername] [varchar](20) NOT NULL,
	[Email] [varchar](30) NOT NULL,
	[NormalizedEmail] [varchar](30) NOT NULL,
	[Fullname] [varchar](30) NULL,
	[PasswordHash] [nvarchar](max) NOT NULL
)

GO


CREATE TYPE [dbo].[IrrigationType] AS TABLE (
    [Id] [UNIQUEIDENTIFIER] NOT NULL,
    [UserId] [INT] NOT NULL,
    [StartTime] DATETIME2(0) NOT NULL,
    [Duration] TIME(7) NOT NULL,
    [DaysOfWeek] VARCHAR(20) NULL,
    [SpecificDate] DATETIME2(0) NULL
)

GO

CREATE TYPE [dbo].[IrrigationHistoryType] AS TABLE (
    [IrrigationId] [UNIQUEIDENTIFIER] NOT NULL,
    [ApplicationUserId] [INT] NOT NULL,
    [StartTime] TIME NOT NULL,
	[EndTime] TIME NOT NULL,
    [Duration] TIME(7) NOT NULL,
    [Date] DATETIME2(0) NULL
)


GO

CREATE TABLE Irrigation (
   Id UNIQUEIDENTIFIER  NOT NULL,
   ApplicationUserId INT NOT NULL,
   StartTime TIME NOT NULL,
   Duration TIME(7) NOT NULL,
   DaysOfWeek VARCHAR(20) NULL,
   SpecificDate DATETIME2(0) NULL,
   PRIMARY KEY(Id),
   FOREIGN KEY (ApplicationUserId) REFERENCES ApplicationUser(ApplicationUserId)
)

GO

CREATE TABLE IrrigationHistory (
   Id INT NOT NULL IDENTITY(1, 1),
   IrrigationId UNIQUEIDENTIFIER NULL,
   ApplicationUserId INT NOT NULL,
   StartTime TIME NOT NULL,
   EndTime TIME NOT NULL,
   Duration TIME(7) NOT NULL,
   Date DATE NOT NULL,
   PRIMARY KEY (Id),
   FOREIGN KEY (IrrigationId) REFERENCES Irrigation(Id) ON DELETE SET NULL,
   FOREIGN KEY (ApplicationUserId) REFERENCES ApplicationUser(ApplicationUserId)
)

GO

CREATE TABLE ApplicationUser (
	ApplicationUserId INT NOT NULL IDENTITY(1, 1),
	Username VARCHAR(20) NOT NULL,
	NormalizedUsername VARCHAR(20) NOT NULL,
	Email VARCHAR(30) NOT NULL,
	NormalizedEmail VARCHAR(30) NOT NULL,
	Fullname VARCHAR(30) NULL,
	PasswordHash NVARCHAR(MAX) NOT NULL,
	PRIMARY KEY(ApplicationUserId)
)

GO

CREATE PROCEDURE [dbo].[Account_GetByUsername]
	@NormalizedUsername VARCHAR(20)
AS
	SELECT 
	   [ApplicationUserId]
      ,[Username]
	  ,[NormalizedUsername]
      ,[Email]
	  ,[Fullname]
      ,[PasswordHash]
	FROM 
		[dbo].[ApplicationUser] t1 
	WHERE
		t1.[NormalizedUsername] = @NormalizedUsername

GO

CREATE PROCEDURE [dbo].[Account_Insert]
	@Account AccountType READONLY
AS
	INSERT INTO 
		[dbo].[ApplicationUser]
           ([Username]
           ,[NormalizedUsername]
           ,[Email]
		   ,[NormalizedEmail]
		   ,[Fullname]
           ,[PasswordHash])
	SELECT
		 [Username]
		,[NormalizedUsername]
		,[Email]
		,[NormalizedEmail]
		,[Fullname]
        ,[PasswordHash]
	FROM
		@Account;

	SELECT CAST(SCOPE_IDENTITY() AS INT);

GO

CREATE PROCEDURE [dbo].[Irrigation_Get]
	@IrrigationId UNIQUEIDENTIFIER
AS
	SELECT 
		[Id]
	   ,[ApplicationUserId]
       ,[Duration]
       ,[StartTime]
       ,[SpecificDate]
       ,[DaysOfWeek]
	 FROM
		[dbo].[Irrigation] t1
	 WHERE
		t1.[Id] = @IrrigationId

GO

CREATE PROCEDURE [dbo].[Irrigation_Upsert]
	@Irrigation IrrigationType READONLY,
	@ApplicationUserId INT
AS

	MERGE INTO [dbo].[Irrigation] TARGET
	USING (
		SELECT
			[Id],
			@ApplicationUserId [ApplicationUserId],
			[StartTime],
			[Duration],
			[DaysOfWeek],
			[SpecificDate]
		FROM
			@Irrigation
	) AS SOURCE
	ON 
	(
		TARGET.[Id] = SOURCE.[Id] AND TARGET.[ApplicationUserId] = SOURCE.[ApplicationUserId]
	)
	WHEN MATCHED THEN
		UPDATE SET
			TARGET.[StartTime] = SOURCE.[StartTime],
			TARGET.[Duration] = SOURCE.[Duration],
			TARGET.[DaysOfWeek] = SOURCE.[DaysOfWeek],
			TARGET.[SpecificDate] = SOURCE.[SpecificDate]
	WHEN NOT MATCHED BY TARGET THEN
		INSERT (
			[Id],
			[ApplicationUserId],
			[StartTime],
			[Duration],
			[DaysOfWeek],
			[SpecificDate]
		)
		VALUES (
			SOURCE.[Id],
			SOURCE.[ApplicationUserId],
			SOURCE.[StartTime],
			SOURCE.[Duration],
			SOURCE.[DaysOfWeek],
			SOURCE.[SpecificDate]
		);

	SELECT CAST(SCOPE_IDENTITY() AS INT);

GO


CREATE PROCEDURE [dbo].[Irrigation_GetAll]
AS
	SELECT 
		[Id]
	   ,[ApplicationUserId]
       ,[StartTime]
       ,[Duration]
       ,[DaysOfWeek]
       ,[SpecificDate]
	 FROM
		[dbo].[Irrigation] t1
	 ORDER BY
		t1.[StartTime], t1.SpecificDate, t1.DaysOfWeek;

GO

CREATE PROCEDURE [dbo].[Irrigation_GetByUserId]
	@ApplicationUserId INT
AS
	SELECT 
		[Id]
	   ,[ApplicationUserId]
       ,[StartTime]
       ,[Duration]
       ,[SpecificDate]
       ,[DaysOfWeek]
	 FROM
		[dbo].[Irrigation] t1
	 WHERE
		t1.[ApplicationUserId] = @ApplicationUserId

GO

CREATE PROCEDURE [dbo].[IrrigationHistory_GetByUserId]
	@ApplicationUserId INT
AS
	SELECT 
		[Id]
	   ,[ApplicationUserId]
	   ,[IrrigationId]
       ,[StartTime]
	   ,[EndTime]
       ,[Duration]
       ,[Date]
	 FROM
		[dbo].[IrrigationHistory] t1
	 WHERE
		t1.[ApplicationUserId] = @ApplicationUserId

GO

CREATE PROCEDURE [dbo].[Irrigation_Delete]
	@IrrigationId UNIQUEIDENTIFIER
AS

	DELETE FROM Irrigation	
	WHERE 
		[Id] = @IrrigationId;
GO

CREATE PROCEDURE [dbo].[IrrigationHistory_Insert]
	@IrrigationHistory IrrigationHistoryType READONLY
AS
	INSERT INTO 
		[dbo].[IrrigationHistory]
           ([IrrigationId]
           ,[ApplicationUserId]
           ,[StartTime]
		   ,[EndTime]
		   ,[Duration]
           ,[Date])
	SELECT
		 [IrrigationId]
		,[ApplicationUserId]
		,[StartTime]
		,[EndTime]
		,[Duration]
        ,[Date]
	FROM
		@IrrigationHistory;

	SELECT CAST(SCOPE_IDENTITY() AS INT);
