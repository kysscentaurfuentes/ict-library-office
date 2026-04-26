--

--

\restrict QNxT8n8klMOQL4FWwjB7vji2Jn1NybTuxOg0iwLN3NWO0eWkvJXH38FTYXjkLyv

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    student_id character varying(20) NOT NULL,
    check_in timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.devices (
    id integer NOT NULL,
    device_id text CONSTRAINT devices_mac_address_not_null NOT NULL,
    custom_name text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- Name: scan_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scan_logs (
    id integer NOT NULL,
    student_id character varying(20),
    device_id text,
    status character varying(10),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    flag text,
    risk_score integer DEFAULT 0
);


--
-- Name: scan_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scan_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scan_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.scan_logs_id_seq OWNED BY public.scan_logs.id;


--
-- Name: share_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.share_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    student_id text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: share_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.share_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: share_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.share_tokens_id_seq OWNED BY public.share_tokens.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password text NOT NULL,
    "StudentId" character varying(20) NOT NULL,
    role character varying(20) DEFAULT 'student'::character varying,
    course character varying(100)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- Name: scan_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scan_logs ALTER COLUMN id SET DEFAULT nextval('public.scan_logs_id_seq'::regclass);


--
-- Name: share_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_tokens ALTER COLUMN id SET DEFAULT nextval('public.share_tokens_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.attendance VALUES (1, '999-99999', '2026-04-23 02:14:10.143', '2026-04-23 02:14:10.144462');
INSERT INTO public.attendance VALUES (2, '999-99999', '2026-04-23 03:17:13.383', '2026-04-23 03:17:13.385861');
INSERT INTO public.attendance VALUES (3, '123-12312', '2026-04-23 06:07:03.267', '2026-04-23 06:07:03.269522');
INSERT INTO public.attendance VALUES (4, '234-23423', '2026-04-24 07:44:45.587', '2026-04-24 07:44:45.589045');


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.devices VALUES (1, 'fe:0c:ed:2e:58:4d', 'Kyss-Centaur-Fumar-s-A15', '2026-04-17 22:22:55.918043');
INSERT INTO public.devices VALUES (10386, '90:78:41:fe:a6:5a', 'Intel Corporate', '2026-04-19 03:19:56.183712');
INSERT INTO public.devices VALUES (7, '12:31:66:e7:1c:88', 'Unknown (192.168.1.6)', '2026-04-17 22:22:55.918189');
INSERT INTO public.devices VALUES (13475, '00:e0:4c:96:a6:0c', 'REALTEK SEMICONDUCTOR CORP.', '2026-04-21 09:38:52.655747');
INSERT INTO public.devices VALUES (2, '40:11:c3:0f:3b:26', 'Samsung Electronics Co.,Ltd', '2026-04-17 22:22:55.91848');
INSERT INTO public.devices VALUES (10485, '4e:c0:45:9f:59:17', 'Unknown (192.168.1.10)', '2026-04-19 18:08:12.767732');
INSERT INTO public.devices VALUES (4, '2c:b6:c2:0e:b1:98', 'zte corporation', '2026-04-17 22:22:55.918385');
INSERT INTO public.devices VALUES (5, 'd2:be:ab:da:4f:b2', 'Unknown (192.168.1.4)', '2026-04-17 22:22:55.918271');
INSERT INTO public.devices VALUES (3, '90:de:80:05:7d:d8', 'DESKTOP-KU8A10G', '2026-04-17 22:22:55.917898');
INSERT INTO public.devices VALUES (6, '98:ba:5f:7e:ba:dd', 'TP-Link Systems Inc.', '2026-04-17 22:22:55.918329');


--
-- Data for Name: scan_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.scan_logs VALUES (1, '99999999', 'dev-w34ij21xv', 'fail', '2026-04-22 16:47:26.558545', NULL, 0);
INSERT INTO public.scan_logs VALUES (2, '99999999', 'dev-w34ij21xv', 'fail', '2026-04-22 16:47:43.598998', NULL, 0);
INSERT INTO public.scan_logs VALUES (3, '12312312', 'dev-w34ij21xv', 'fail', '2026-04-22 16:47:58.233771', NULL, 0);
INSERT INTO public.scan_logs VALUES (4, '99999999', 'dev-w34ij21xv', 'fail', '2026-04-22 16:48:48.37061', NULL, 0);
INSERT INTO public.scan_logs VALUES (5, '99999999', 'dev-w34ij21xv', 'fail', '2026-04-22 16:59:05.592036', NULL, 0);
INSERT INTO public.scan_logs VALUES (6, '99999999', 'dev-w34ij21xv', 'fail', '2026-04-22 16:59:08.14196', NULL, 0);
INSERT INTO public.scan_logs VALUES (7, '99999999', 'dev-w34ij21xv', 'fail', '2026-04-22 16:59:08.235', NULL, 0);
INSERT INTO public.scan_logs VALUES (8, '999-99999', 'dev-w34ij21xv', 'success', '2026-04-22 17:03:23.613226', NULL, 0);
INSERT INTO public.scan_logs VALUES (9, '123-12312', 'dev-w34ij21xv', 'success', '2026-04-22 17:04:27.36583', NULL, 0);
INSERT INTO public.scan_logs VALUES (10, '211-01890', 'dev-w34ij21xv', 'fail', '2026-04-22 17:05:50.26966', NULL, 0);
INSERT INTO public.scan_logs VALUES (11, '211-01890', 'dev-w34ij21xv', 'fail', '2026-04-22 17:06:13.840683', NULL, 0);
INSERT INTO public.scan_logs VALUES (12, '123-12312', 'dev-w34ij21xv', 'success', '2026-04-22 21:39:33.412818', 'multi_account_device', 1);
INSERT INTO public.scan_logs VALUES (13, '999-99999', 'dev-w34ij21xv', 'success', '2026-04-22 21:40:26.743603', 'multi_account_device', 1);
INSERT INTO public.scan_logs VALUES (14, '123-45123', 'dev-w34ij21xv', 'success', '2026-04-22 21:42:05.004558', 'multi_account_device', 1);
INSERT INTO public.scan_logs VALUES (15, '123-45123', 'dev-w34ij21xv', 'closed', '2026-04-23 01:43:12.437423', 'multi_account_device', 1);
INSERT INTO public.scan_logs VALUES (16, '123-45123', 'dev-w34ij21xv', 'blocked', '2026-04-23 01:54:19.139111', 'cooldown_violation', 1);
INSERT INTO public.scan_logs VALUES (17, '234-23423', 'dev-w34ij21xv', 'closed', '2026-04-23 01:55:04.931934', 'multi_account_device', 1);
INSERT INTO public.scan_logs VALUES (18, '999-99999', 'dev-w34ij21xv', 'success', '2026-04-23 02:14:10.152172', 'multi_account_device', 1);
INSERT INTO public.scan_logs VALUES (19, '999-99999', 'dev-w34ij21xv', 'blocked', '2026-04-23 02:16:30.83923', 'cooldown_violation', 1);
INSERT INTO public.scan_logs VALUES (20, '999-99999', 'dev-w34ij21xv', 'success', '2026-04-23 03:17:13.387444', 'multi_account_device', 1);
INSERT INTO public.scan_logs VALUES (21, '123-12312', 'dev-w34ij21xv', 'success', '2026-04-23 06:07:03.278483', 'multi_account_device', 1);
INSERT INTO public.scan_logs VALUES (22, '234-23423', 'dev-w34ij21xv', 'success', '2026-04-24 07:44:45.599175', 'multi_account_device', 1);


--
-- Data for Name: share_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.share_tokens VALUES (1, 'ec42c933537adaeec46293ad5a5dcea24a93f8cdb97548fb', '234-23423', '2026-04-24 07:46:37.472764');
INSERT INTO public.share_tokens VALUES (2, 'd4cfd11ad86fc261a8b910320f182d1c3fd49e54a7ddbfdd', '123-12312', '2026-04-24 07:47:53.900402');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, '123', '$2b$10$bpuoQOeHxgcq3lEt5qmoE.KIliQzYc5iTOS0ZSirwJEQY90LHE40O', '123-12312', 'student', NULL);
INSERT INTO public.users VALUES (2, '234', '$2b$10$Ztl33XUvt9bPeCpb2JcrROnjjalG2FGFWxGflr1ahnxcL3Hv0eyJu', '234-23423', 'student', NULL);
INSERT INTO public.users VALUES (4, '12345', '$2b$10$/5rkqlN8Igpeu2gAYrxEb.bdL8iZBlVLLfB8tRQNLN5NklpjSnapu', '123-45123', 'student', NULL);
INSERT INTO public.users VALUES (3, 'Kyss.fuentes2@gmail.com', '$2a$06$A5GfT4fAVNzVl0oxv4cfyuxXtP0KNW0GGSbdQDw8em13.mTM3Au.K', '999-99999', 'admin', NULL);


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendance_id_seq', 4, true);


--
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.devices_id_seq', 16995, true);


--
-- Name: scan_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scan_logs_id_seq', 22, true);


--
-- Name: share_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.share_tokens_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: devices devices_mac_address_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_mac_address_key UNIQUE (device_id);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: scan_logs scan_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scan_logs
    ADD CONSTRAINT scan_logs_pkey PRIMARY KEY (id);


--
-- Name: share_tokens share_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_tokens
    ADD CONSTRAINT share_tokens_pkey PRIMARY KEY (id);


--
-- Name: share_tokens share_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_tokens
    ADD CONSTRAINT share_tokens_token_key UNIQUE (token);


--
-- Name: users users_StudentId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_StudentId_key" UNIQUE ("StudentId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: attendance fk_student; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public.users("StudentId");


--

--

\unrestrict QNxT8n8klMOQL4FWwjB7vji2Jn1NybTuxOg0iwLN3NWO0eWkvJXH38FTYXjkLyv

