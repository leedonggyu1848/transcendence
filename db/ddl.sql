create table if not exists  chat
(
    id       serial
        constraint "PK_9d0b2ba74336710fd31154738a5"
            primary key,
    title    varchar not null
        constraint "UQ_ca8307d94feb11060e0cf5f724b"
            unique,
    type     integer not null,
    password varchar not null,
    owner    integer not null,
    count    integer not null
);

create table if not exists  ban
(
    id       serial
        constraint "PK_071cddb7d5f18439fd992490618"
            primary key,
    "userId" integer not null,
    "chatId" integer
        constraint "FK_3b6fc1efcf5183db4dff38e20ac"
            references chat
);

create table if not exists  administrator
(
    id       serial
        constraint "PK_ee58e71b3b4008b20ddc7b3092b"
            primary key,
    "userId" integer not null,
    "chatId" integer
        constraint "FK_b68493687a0b9acae27c1ccf241"
            references chat
);

create table if not exists  game
(
    id              serial
        constraint "PK_352a30652cd352f552fef73dec5"
            primary key,
    title           varchar not null
        constraint "UQ_0152ed47a9e8963b5aaceb51e77"
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
        constraint "PK_cace4a159ff9f2512dd42373760"
            primary key,
    "userId"      integer                               not null
        constraint "UQ_d72ea127f30e21753c9e229891e"
            unique,
    "socketId"    varchar default ''::character varying not null,
    "userName"    varchar                               not null
        constraint "UQ_da5934070b5f2726ebfd3122c80"
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
        constraint "FK_cf8c0e7b6afbaf0bd0920fad396"
            references game,
    "watchGameId" integer
        constraint "FK_747d685ba260f7659a13d08456f"
            references game
);

create table if not exists  block
(
    id          serial
        constraint "PK_d0925763efb591c2e2ffb267572"
            primary key,
    "blockUser" varchar not null,
    "userId"    integer
        constraint "FK_b7c8985f27f5b0d1820832318da"
            references "user"
);

create table if not exists  chat_user
(
    id       serial
        constraint "PK_15d83eb496fd7bec7368b30dbf3"
            primary key,
    "chatId" integer
        constraint "FK_8826d04b711b84e36398894275c"
            references chat,
    "userId" integer
        constraint "FK_5e9874ea3bd3524db95c2d88e53"
            references "user"
);

create table if not exists  friend
(
    id              serial
        constraint "PK_1b301ac8ac5fcee876db96069b6"
            primary key,
    "friendName"    varchar   not null,
    "friendProfile" varchar   not null,
    accept          boolean   not null,
    time            timestamp not null,
    "userId"        integer
        constraint "FK_855044ea856e46f62a46acebd65"
            references "user"
);

create table if not exists  record
(
    id         serial
        constraint "PK_5cb1f4d1aff275cf9001f4343b9"
            primary key,
    "gameType" integer   not null,
    opponent   varchar   not null,
    win        boolean   not null,
    time       timestamp not null,
    "playerId" integer
        constraint "FK_b167bf67eb2a1bc4b7c0d8ff40a"
            references "user"
);

