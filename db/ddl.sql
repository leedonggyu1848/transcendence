create table if not exists  chat
(
    id       serial
        constraint "PK_CHAT"
            primary key,
    title    varchar not null
        constraint "UQ_CHAT_TITLE"
            unique,
    type     integer not null,
    password varchar not null,
    owner    integer not null,
    count    integer not null
);

create table if not exists  ban
(
    id       serial
        constraint "PK_BAN"
            primary key,
    "userId" integer not null,
    "chatId" integer
        constraint "FK_BAN_CHAT_ID"
            references chat
);

create table if not exists  administrator
(
    id       serial
        constraint "PK_ADMINISTRATOR"
            primary key,
    "userId" integer not null,
    "chatId" integer
        constraint "FK_ADMINISTRATOR_CHAT_ID"
            references chat
);

create table if not exists  game
(
    id              serial
        constraint "PK_GAME"
            primary key,
    title           varchar not null
        constraint "UQ_GAME_TITLE"
            unique,
    "interruptMode" boolean not null,
    "privateMode"   boolean not null,
    password        varchar not null,
    count           integer not null,
    type            integer not null,
    playing         boolean not null
);

create table if not exists  "user"
(
    id            serial
        constraint "PK_USER"
            primary key,
    "userId"      integer                               not null
        constraint "UQ_USER_USER_ID"
            unique,
    "socketId"    varchar default ''::character varying not null,
    "userName"    varchar                               not null
        constraint "UQ_USER_NAME"
            unique,
    email         varchar                               not null,
    auth          boolean                               not null,
    profile       varchar                               not null,
    introduce     varchar                               not null,
    "normalWin"   integer                               not null,
    "normalLose"  integer                               not null,
    "rankWin"     integer                               not null,
    "rankLose"    integer                               not null,
    "joinType"    integer                               not null,
    "playGameId"  integer
        constraint "FK_USER_PLAY_GAME_ID"
            references game,
    "watchGameId" integer
        constraint "FK_USER_WATCH_GAME_ID"
            references game
);

create table if not exists  block
(
    id          serial
        constraint "PK_BLOCK"
            primary key,
    "blockUser" varchar not null,
    "userId"    integer
        constraint "FK_BLOCK_USER_ID"
            references "user"
);

create table if not exists  chat_user
(
    id       serial
        constraint "PK_CHAT_USER"
            primary key,
    "chatId" integer
        constraint "FK_CHAT_USER_CHAT_ID"
            references chat,
    "userId" integer
        constraint "FK_CHAT_USER_USER_ID"
            references "user"
);

create table if not exists  friend
(
    id              serial
        constraint "PK_FRIEND"
            primary key,
    "friendName"    varchar   not null,
    "friendProfile" varchar   not null,
    accept          boolean   not null,
    time            timestamp not null,
    "userId"        integer
        constraint "FK_FRIEND_USER_ID"
            references "user"
);

create table if not exists  record
(
    id         serial
        constraint "PK_RECORD"
            primary key,
    "gameType" integer   not null,
    opponent   varchar   not null,
    win        boolean   not null,
    time       timestamp not null,
    "playerId" integer
        constraint "FK_RECORD_PLAYER_ID"
            references "user"
);

