--
-- PostgreSQL database dump
--

\restrict Mjpf2ToaFthtdbW4CiYaxMCSYLvt27hORQw1KKcb8DwchZC3F0J48SD6n7WboLc

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-24 23:24:25

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 41210)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5226 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 293 (class 1255 OID 49506)
-- Name: prevent_policy_history_modification(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.prevent_policy_history_modification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'policy_acceptance_history is immutable';
END;
$$;


ALTER FUNCTION public.prevent_policy_history_modification() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 41248)
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    student_id character varying(20) NOT NULL,
    check_in timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 41255)
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_id_seq OWNER TO postgres;

--
-- TOC entry 5227 (class 0 OID 0)
-- Dependencies: 221
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- TOC entry 255 (class 1259 OID 49513)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    user_id integer,
    action text NOT NULL,
    target_table text,
    target_id text,
    metadata jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 49512)
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5228 (class 0 OID 0)
-- Dependencies: 254
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- TOC entry 235 (class 1259 OID 41390)
-- Name: commands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commands (
    id integer NOT NULL,
    type character varying(20) NOT NULL,
    mac character varying(17) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    processed boolean DEFAULT false
);


ALTER TABLE public.commands OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 41389)
-- Name: commands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.commands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commands_id_seq OWNER TO postgres;

--
-- TOC entry 5229 (class 0 OID 0)
-- Dependencies: 234
-- Name: commands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.commands_id_seq OWNED BY public.commands.id;


--
-- TOC entry 222 (class 1259 OID 41256)
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devices (
    id integer NOT NULL,
    device_id text CONSTRAINT devices_mac_address_not_null NOT NULL,
    custom_name text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 41264)
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devices_id_seq OWNER TO postgres;

--
-- TOC entry 5230 (class 0 OID 0)
-- Dependencies: 223
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- TOC entry 224 (class 1259 OID 41265)
-- Name: forgot_password_security; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forgot_password_security (
    id integer NOT NULL,
    ip_address text NOT NULL,
    identifier text NOT NULL,
    request_count integer DEFAULT 0,
    last_request_at timestamp without time zone,
    locked_until timestamp without time zone,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.forgot_password_security OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 41275)
-- Name: forgot_password_security_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.forgot_password_security_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forgot_password_security_id_seq OWNER TO postgres;

--
-- TOC entry 5231 (class 0 OID 0)
-- Dependencies: 225
-- Name: forgot_password_security_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.forgot_password_security_id_seq OWNED BY public.forgot_password_security.id;


--
-- TOC entry 251 (class 1259 OID 49461)
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_resets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    otp_hash text,
    otp_expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 49460)
-- Name: password_resets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_resets_id_seq OWNER TO postgres;

--
-- TOC entry 5232 (class 0 OID 0)
-- Dependencies: 250
-- Name: password_resets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;


--
-- TOC entry 253 (class 1259 OID 49489)
-- Name: policy_acceptance_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policy_acceptance_history (
    id integer NOT NULL,
    user_id integer,
    policy_version text NOT NULL,
    accepted_at timestamp without time zone DEFAULT now(),
    ip_address text,
    user_agent text,
    evidence_hash text,
    acceptance_source text
);


ALTER TABLE public.policy_acceptance_history OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 49488)
-- Name: policy_acceptance_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.policy_acceptance_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.policy_acceptance_history_id_seq OWNER TO postgres;

--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 252
-- Name: policy_acceptance_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.policy_acceptance_history_id_seq OWNED BY public.policy_acceptance_history.id;


--
-- TOC entry 226 (class 1259 OID 41276)
-- Name: scan_logs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.scan_logs OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 41284)
-- Name: scan_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scan_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scan_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 227
-- Name: scan_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scan_logs_id_seq OWNED BY public.scan_logs.id;


--
-- TOC entry 228 (class 1259 OID 41285)
-- Name: share_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.share_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    student_id text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.share_tokens OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 41294)
-- Name: share_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.share_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.share_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 229
-- Name: share_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.share_tokens_id_seq OWNED BY public.share_tokens.id;


--
-- TOC entry 230 (class 1259 OID 41295)
-- Name: signup_pending; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.signup_pending (
    id integer NOT NULL,
    first_name text NOT NULL,
    middle_name text,
    last_name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "StudentId" text NOT NULL,
    course text NOT NULL,
    school_id_image text NOT NULL,
    signup_otp text NOT NULL,
    signup_otp_expires_at timestamp without time zone NOT NULL,
    failed_signup_attempts integer DEFAULT 0,
    signup_locked_until timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    email_verified boolean DEFAULT false,
    account_status text DEFAULT 'PENDING'::text,
    policy_accepted boolean DEFAULT false,
    policy_version text,
    policy_accepted_at timestamp without time zone,
    rejected_reason text,
    rejected_at timestamp without time zone,
    rejected_by integer
);


ALTER TABLE public.signup_pending OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 41312)
-- Name: signup_pending_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.signup_pending_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.signup_pending_id_seq OWNER TO postgres;

--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 231
-- Name: signup_pending_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.signup_pending_id_seq OWNED BY public.signup_pending.id;


--
-- TOC entry 237 (class 1259 OID 41402)
-- Name: sync_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sync_queue (
    id integer NOT NULL,
    table_name text NOT NULL,
    operation text NOT NULL,
    payload jsonb NOT NULL,
    synced boolean DEFAULT false,
    retry_count integer DEFAULT 0,
    last_error text,
    created_at timestamp without time zone DEFAULT now(),
    synced_at timestamp without time zone,
    failed boolean DEFAULT false,
    error_message text
);


ALTER TABLE public.sync_queue OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 41401)
-- Name: sync_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sync_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sync_queue_id_seq OWNER TO postgres;

--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 236
-- Name: sync_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sync_queue_id_seq OWNED BY public.sync_queue.id;


--
-- TOC entry 242 (class 1259 OID 49378)
-- Name: user_2fa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_2fa (
    id integer NOT NULL,
    user_id integer NOT NULL,
    enabled boolean DEFAULT false,
    confirmed boolean DEFAULT false,
    secret text,
    temp_secret text,
    backup_codes text[],
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_2fa OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 49377)
-- Name: user_2fa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_2fa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_2fa_id_seq OWNER TO postgres;

--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 241
-- Name: user_2fa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_2fa_id_seq OWNED BY public.user_2fa.id;


--
-- TOC entry 232 (class 1259 OID 41313)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    password text NOT NULL,
    "StudentId" character varying(20) NOT NULL,
    role character varying(20) DEFAULT 'student'::character varying,
    course character varying(150),
    email character varying(100),
    first_name character varying(100),
    middle_name character varying(100),
    last_name character varying(100),
    school_id_image text,
    suffix character varying(10),
    suffix_locked boolean DEFAULT false,
    phone_number character varying(15),
    year_level character varying(20),
    profile_picture text,
    birthdate date,
    age integer,
    gender character varying(20),
    nationality character varying(100) DEFAULT 'Filipino'::character varying,
    user_classification character varying(100),
    student_type character varying(100),
    college_department character varying(150),
    program character varying(150),
    birthdate_locked boolean DEFAULT false,
    gender_locked boolean DEFAULT false,
    nationality_locked boolean DEFAULT false,
    vibration_enabled boolean DEFAULT true,
    dark_mode boolean DEFAULT false NOT NULL,
    two_factor_enabled boolean DEFAULT false,
    two_factor_otp text,
    two_factor_otp_expires_at timestamp without time zone,
    failed_login_attempts integer DEFAULT 0,
    login_locked_until timestamp without time zone,
    failed_otp_attempts integer DEFAULT 0,
    otp_locked_until timestamp without time zone,
    last_otp_sent_at timestamp without time zone,
    account_status character varying(20) DEFAULT 'PENDING'::character varying,
    forgot_password_otp text,
    forgot_password_otp_expires_at timestamp without time zone,
    failed_forgot_attempts integer DEFAULT 0,
    forgot_locked_until timestamp without time zone,
    failed_change_password_attempts integer DEFAULT 0,
    change_password_locked_until timestamp without time zone,
    forgot_request_count integer DEFAULT 0,
    forgot_request_locked_until timestamp without time zone,
    forgot_request_last_ip text,
    forgot_request_last_sent_at timestamp without time zone,
    two_factor_secret text,
    two_factor_backup_codes text[],
    two_factor_temp_secret text,
    two_factor_confirmed boolean DEFAULT false,
    policy_accepted boolean DEFAULT false,
    policy_version text,
    policy_accepted_at timestamp without time zone,
    CONSTRAINT account_status_check CHECK (((account_status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('APPROVED'::character varying)::text, ('REJECTED'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 49399)
-- Name: user_2fa_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_2fa_view AS
 SELECT t.id,
    t.user_id,
    u."StudentId",
    u.first_name,
    u.last_name,
    t.enabled,
    t.confirmed,
    t.created_at,
    t.updated_at
   FROM (public.user_2fa t
     JOIN public.users u ON ((u.id = t.user_id)));


ALTER VIEW public.user_2fa_view OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 49352)
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_preferences (
    id integer NOT NULL,
    user_id integer NOT NULL,
    dark_mode boolean DEFAULT false,
    vibration_enabled boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_preferences OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 49351)
-- Name: user_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_preferences_id_seq OWNER TO postgres;

--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 238
-- Name: user_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_preferences_id_seq OWNED BY public.user_preferences.id;


--
-- TOC entry 240 (class 1259 OID 49371)
-- Name: user_preferences_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_preferences_view AS
 SELECT up.id,
    up.user_id,
    u."StudentId",
    u.first_name,
    u.last_name,
    up.dark_mode,
    up.vibration_enabled,
    up.created_at,
    up.updated_at
   FROM (public.user_preferences up
     JOIN public.users u ON ((u.id = up.user_id)));


ALTER VIEW public.user_preferences_view OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 49432)
-- Name: user_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile (
    id integer NOT NULL,
    user_id integer NOT NULL,
    suffix text,
    suffix_locked boolean DEFAULT false,
    phone_number text,
    birthdate date,
    birthdate_locked boolean DEFAULT false,
    age integer,
    gender text,
    gender_locked boolean DEFAULT false,
    nationality text,
    nationality_locked boolean DEFAULT false,
    user_classification text,
    student_type text,
    college_department text,
    program text,
    year_level text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_profile OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 49431)
-- Name: user_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profile_id_seq OWNER TO postgres;

--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 247
-- Name: user_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_profile_id_seq OWNED BY public.user_profile.id;


--
-- TOC entry 249 (class 1259 OID 49455)
-- Name: user_profile_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_profile_view AS
 SELECT p.id,
    p.user_id,
    u."StudentId",
    u.first_name,
    u.middle_name,
    u.last_name,
    p.phone_number,
    p.gender,
    p.nationality,
    p.program,
    p.year_level,
    p.updated_at
   FROM (public.user_profile p
     JOIN public.users u ON ((u.id = p.user_id)));


ALTER VIEW public.user_profile_view OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 49405)
-- Name: user_security; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_security (
    id integer NOT NULL,
    user_id integer NOT NULL,
    failed_login_attempts integer DEFAULT 0,
    login_locked_until timestamp without time zone,
    failed_otp_attempts integer DEFAULT 0,
    otp_locked_until timestamp without time zone,
    failed_forgot_attempts integer DEFAULT 0,
    forgot_locked_until timestamp without time zone,
    failed_change_password_attempts integer DEFAULT 0,
    change_password_locked_until timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_security OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 49404)
-- Name: user_security_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_security_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_security_id_seq OWNER TO postgres;

--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 244
-- Name: user_security_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_security_id_seq OWNED BY public.user_security.id;


--
-- TOC entry 246 (class 1259 OID 49426)
-- Name: user_security_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_security_view AS
 SELECT s.id,
    s.user_id,
    u."StudentId",
    u.first_name,
    u.last_name,
    s.failed_login_attempts,
    s.login_locked_until,
    s.failed_otp_attempts,
    s.otp_locked_until,
    s.failed_forgot_attempts,
    s.forgot_locked_until,
    s.failed_change_password_attempts,
    s.change_password_locked_until,
    s.updated_at
   FROM (public.user_security s
     JOIN public.users u ON ((u.id = s.user_id)));


ALTER VIEW public.user_security_view OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 41338)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 233
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4885 (class 2604 OID 41339)
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- TOC entry 4958 (class 2604 OID 49516)
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 41393)
-- Name: commands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commands ALTER COLUMN id SET DEFAULT nextval('public.commands_id_seq'::regclass);


--
-- TOC entry 4887 (class 2604 OID 41340)
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- TOC entry 4889 (class 2604 OID 41341)
-- Name: forgot_password_security id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forgot_password_security ALTER COLUMN id SET DEFAULT nextval('public.forgot_password_security_id_seq'::regclass);


--
-- TOC entry 4953 (class 2604 OID 49464)
-- Name: password_resets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);


--
-- TOC entry 4956 (class 2604 OID 49492)
-- Name: policy_acceptance_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_acceptance_history ALTER COLUMN id SET DEFAULT nextval('public.policy_acceptance_history_id_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 41342)
-- Name: scan_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_logs ALTER COLUMN id SET DEFAULT nextval('public.scan_logs_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 41343)
-- Name: share_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_tokens ALTER COLUMN id SET DEFAULT nextval('public.share_tokens_id_seq'::regclass);


--
-- TOC entry 4897 (class 2604 OID 41344)
-- Name: signup_pending id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signup_pending ALTER COLUMN id SET DEFAULT nextval('public.signup_pending_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 41405)
-- Name: sync_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_queue ALTER COLUMN id SET DEFAULT nextval('public.sync_queue_id_seq'::regclass);


--
-- TOC entry 4934 (class 2604 OID 49381)
-- Name: user_2fa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_2fa ALTER COLUMN id SET DEFAULT nextval('public.user_2fa_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 49355)
-- Name: user_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_preferences_id_seq'::regclass);


--
-- TOC entry 4946 (class 2604 OID 49435)
-- Name: user_profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile ALTER COLUMN id SET DEFAULT nextval('public.user_profile_id_seq'::regclass);


--
-- TOC entry 4939 (class 2604 OID 49408)
-- Name: user_security id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_security ALTER COLUMN id SET DEFAULT nextval('public.user_security_id_seq'::regclass);


--
-- TOC entry 4903 (class 2604 OID 41345)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5189 (class 0 OID 41248)
-- Dependencies: 220
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, student_id, check_in, created_at) FROM stdin;
\.


--
-- TOC entry 5220 (class 0 OID 49513)
-- Dependencies: 255
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, target_table, target_id, metadata, ip_address, user_agent, created_at) FROM stdin;
1	7	SUCCESSFUL_LOGIN	users	7	{"email": "kyss.fuentes1@gmail.com", "requiresPolicyUpdate": true}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:27:59.550111
2	7	USER_ACCEPTED_POLICY	policy_acceptance_history	1	{"evidenceHash": "ff7adf2bf08918219cc0e01bbc167af415687ba7fb713b75d5ad8522d08ab7dd", "policyVersion": "v1.8"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:28:06.602051
3	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:28:27.729493
4	\N	PASSWORD_RESET_BLOCKED	\N	\N	{"reason": "CAPTCHA_REQUIRED", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:28:45.134194
5	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:28:57.21794
6	7	PASSWORD_RESET_COMPLETED	users	7	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:29:41.975327
7	7	SUCCESSFUL_LOGIN	users	7	{"email": "kyss.fuentes1@gmail.com", "requiresPolicyUpdate": false}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:29:59.603608
8	7	TWO_FACTOR_ENABLED	user_2fa	7	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:30:25.333855
9	7	TWO_FACTOR_DISABLED	user_2fa	7	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:30:43.776512
10	7	ADMIN_APPROVED_USER	users	31	{"approvedUserId": 31}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:30:58.116513
11	7	ADMIN_REJECTED_USER	signup_pending	332	{"rejectedUserId": 332}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:31:10.995613
12	7	PASSWORD_CHANGED	users	7	{"changeType": "authenticated_change"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 13:31:44.917172
13	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 14:10:41.03045
14	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 14:14:34.551436
15	7	SUCCESSFUL_LOGIN	users	7	{"email": "kyss.fuentes1@gmail.com", "requiresPolicyUpdate": false}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 14:14:37.580088
16	7	ADMIN_REJECTED_USER	signup_pending	327	{"rejectedBy": 7, "rejectedReason": "Ampangit mo kasi. Hahahaha", "rejectedUserId": 327}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 14:16:37.880314
17	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 15:37:32.5945
18	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 15:37:36.402484
19	7	SUCCESSFUL_LOGIN	users	7	{"email": "kyss.fuentes1@gmail.com", "requiresPolicyUpdate": false}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 15:37:39.896995
20	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 15:37:54.991014
21	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 15:38:13.134711
22	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 15:38:13.299137
23	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 15:38:13.587006
24	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 15:38:13.738609
25	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 15:50:18.964833
26	7	SUCCESSFUL_LOGIN	users	7	{"email": "kyss.fuentes1@gmail.com", "requiresPolicyUpdate": false}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:01:36.283594
27	7	SUCCESSFUL_LOGIN	users	7	{"email": "kyss.fuentes1@gmail.com", "requiresPolicyUpdate": false}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:12:20.733359
28	7	PASSWORD_CHANGED	users	7	{"changeType": "authenticated_change"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:12:41.582441
29	7	SUCCESSFUL_LOGIN	users	7	{"email": "kyss.fuentes1@gmail.com", "requiresPolicyUpdate": false}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:19:07.731381
30	7	SUCCESSFUL_LOGIN	users	7	{"email": "kyss.fuentes1@gmail.com", "requiresPolicyUpdate": false}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:22:27.239577
31	\N	FAILED_LOGIN	\N	\N	{"reason": "INVALID_PASSWORD", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:24:11.066449
32	\N	PASSWORD_RESET_BLOCKED	\N	\N	{"reason": "CAPTCHA_REQUIRED", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:33:14.524992
33	\N	PASSWORD_RESET_BLOCKED	\N	\N	{"reason": "CAPTCHA_FAILED", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:36:34.961869
34	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:39:36.35117
35	7	PASSWORD_RESET_COMPLETED	users	7	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:40:16.5171
36	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:56:31.014955
37	7	PASSWORD_RESET_COMPLETED	users	7	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 16:57:00.408796
38	\N	PASSWORD_RESET_BLOCKED	\N	\N	{"reason": "CAPTCHA_REQUIRED", "identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 17:18:37.401059
39	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 17:18:50.167633
40	7	PASSWORD_RESET_COMPLETED	users	7	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 17:19:18.378503
41	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 17:28:55.690561
42	7	PASSWORD_RESET_COMPLETED	users	7	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 17:29:17.649965
43	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 17:36:04.494668
44	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 17:36:40.812024
45	7	PASSWORD_RESET_COMPLETED	users	7	{"identifier": "211-01850"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-24 17:38:04.113038
\.


--
-- TOC entry 5204 (class 0 OID 41390)
-- Dependencies: 235
-- Data for Name: commands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commands (id, type, mac, created_at, processed) FROM stdin;
\.


--
-- TOC entry 5191 (class 0 OID 41256)
-- Dependencies: 222
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devices (id, device_id, custom_name, created_at) FROM stdin;
10386	90:78:41:fe:a6:5a	Intel Corporate	2026-04-19 03:19:56.183712
13475	00:e0:4c:96:a6:0c	REALTEK SEMICONDUCTOR CORP.	2026-04-21 09:38:52.655747
10485	4e:c0:45:9f:59:17	Unknown (192.168.1.10)	2026-04-19 18:08:12.767732
5	d2:be:ab:da:4f:b2	Unknown (192.168.1.4)	2026-04-17 22:22:55.918271
1	fe:0c:ed:2e:58:4d	Kyss-Centaur-Fumar-s-A15	2026-04-17 22:22:55.918043
3	90:de:80:05:7d:d8	DESKTOP-KU8A10G	2026-04-17 22:22:55.917898
16997	8e:01:ae:ce:b5:ef	Kyss-Centaur-Fumar-s-A15	2026-04-28 14:54:39.305449
4	2c:b6:c2:0e:b1:98	zte corporation	2026-04-17 22:22:55.918385
6	98:ba:5f:7e:ba:dd	TP-Link Systems Inc.	2026-04-17 22:22:55.918329
2	40:11:c3:0f:3b:26	Samsung Electronics Co.,Ltd	2026-04-17 22:22:55.91848
7	12:31:66:e7:1c:88	Unknown (192.168.1.6)	2026-04-17 22:22:55.918189
\.


--
-- TOC entry 5193 (class 0 OID 41265)
-- Dependencies: 224
-- Data for Name: forgot_password_security; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forgot_password_security (id, ip_address, identifier, request_count, last_request_at, locked_until, user_agent, created_at) FROM stdin;
4	127.0.0.1	211-01850	1	2026-05-24 17:36:38.151202	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-05-22 16:46:01.147265
\.


--
-- TOC entry 5216 (class 0 OID 49461)
-- Dependencies: 251
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_resets (id, user_id, otp_hash, otp_expires_at, created_at, updated_at) FROM stdin;
1	11	dc097e93445cb0c036e600dfe7fed59e87e30910cfed28eb01a77977ebe3c783	2026-05-20 11:01:15.830991	2026-05-22 15:20:17.7461	2026-05-22 16:58:59.537631
\.


--
-- TOC entry 5218 (class 0 OID 49489)
-- Dependencies: 253
-- Data for Name: policy_acceptance_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policy_acceptance_history (id, user_id, policy_version, accepted_at, ip_address, user_agent, evidence_hash, acceptance_source) FROM stdin;
1	7	v1.8	2026-05-24 13:28:06.60097	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	ff7adf2bf08918219cc0e01bbc167af415687ba7fb713b75d5ad8522d08ab7dd	\N
\.


--
-- TOC entry 5195 (class 0 OID 41276)
-- Dependencies: 226
-- Data for Name: scan_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scan_logs (id, student_id, device_id, status, created_at, flag, risk_score) FROM stdin;
1	99999999	dev-w34ij21xv	fail	2026-04-22 16:47:26.558545	\N	0
2	99999999	dev-w34ij21xv	fail	2026-04-22 16:47:43.598998	\N	0
3	12312312	dev-w34ij21xv	fail	2026-04-22 16:47:58.233771	\N	0
4	99999999	dev-w34ij21xv	fail	2026-04-22 16:48:48.37061	\N	0
5	99999999	dev-w34ij21xv	fail	2026-04-22 16:59:05.592036	\N	0
6	99999999	dev-w34ij21xv	fail	2026-04-22 16:59:08.14196	\N	0
7	99999999	dev-w34ij21xv	fail	2026-04-22 16:59:08.235	\N	0
8	999-99999	dev-w34ij21xv	success	2026-04-22 17:03:23.613226	\N	0
9	123-12312	dev-w34ij21xv	success	2026-04-22 17:04:27.36583	\N	0
10	211-01890	dev-w34ij21xv	fail	2026-04-22 17:05:50.26966	\N	0
11	211-01890	dev-w34ij21xv	fail	2026-04-22 17:06:13.840683	\N	0
12	123-12312	dev-w34ij21xv	success	2026-04-22 21:39:33.412818	multi_account_device	1
13	999-99999	dev-w34ij21xv	success	2026-04-22 21:40:26.743603	multi_account_device	1
14	123-45123	dev-w34ij21xv	success	2026-04-22 21:42:05.004558	multi_account_device	1
15	123-45123	dev-w34ij21xv	closed	2026-04-23 01:43:12.437423	multi_account_device	1
16	123-45123	dev-w34ij21xv	blocked	2026-04-23 01:54:19.139111	cooldown_violation	1
17	234-23423	dev-w34ij21xv	closed	2026-04-23 01:55:04.931934	multi_account_device	1
18	999-99999	dev-w34ij21xv	success	2026-04-23 02:14:10.152172	multi_account_device	1
19	999-99999	dev-w34ij21xv	blocked	2026-04-23 02:16:30.83923	cooldown_violation	1
20	999-99999	dev-w34ij21xv	success	2026-04-23 03:17:13.387444	multi_account_device	1
21	123-12312	dev-w34ij21xv	success	2026-04-23 06:07:03.278483	multi_account_device	1
22	234-23423	dev-w34ij21xv	success	2026-04-24 07:44:45.599175	multi_account_device	1
23	211-01850	dev-w34ij21xv	success	2026-05-15 07:21:04.601308	multi_account_device	1
24	211-01850	dev-w34ij21xv	success	2026-05-15 07:22:03.144613	multi_account_device	1
25	211-01850	dev-w34ij21xv	success	2026-05-15 07:23:18.548913	multi_account_device	1
26	211-01850	dev-w34ij21xv	success	2026-05-15 08:20:08.95642	multi_account_device	1
27	211-01850	dev-w34ij21xv	success	2026-05-15 08:20:22.444994	multi_account_device	1
28	211-01850	dev-w34ij21xv	success	2026-05-15 08:21:33.237925	multi_account_device	1
29	211-01850	dev-w34ij21xv	success	2026-05-15 08:23:40.156818	multi_account_device	1
30	211-01850	dev-w34ij21xv	success	2026-05-15 08:24:04.816168	multi_account_device	1
31	211-01850	dev-w34ij21xv	success	2026-05-15 08:32:04.271867	multi_account_device	1
32	211-01850	dev-w34ij21xv	success	2026-05-15 08:32:24.516976	multi_account_device	1
33	211-01850	dev-w34ij21xv	success	2026-05-15 08:40:39.771703	multi_account_device	1
34	211-01850	dev-w34ij21xv	success	2026-05-15 08:48:47.187565	multi_account_device	1
35	211-01850	dev-w34ij21xv	success	2026-05-15 08:49:26.118942	multi_account_device	1
36	211-01850	dev-w34ij21xv	success	2026-05-15 08:57:08.865954	multi_account_device	1
37	211-01850	dev-w34ij21xv	success	2026-05-15 09:03:25.889724	multi_account_device	1
38	211-01850	dev-w34ij21xv	success	2026-05-15 09:08:39.461998	multi_account_device	1
39	211-01850	dev-w34ij21xv	success	2026-05-15 09:15:52.833238	multi_account_device	1
40	211-01850	dev-w34ij21xv	success	2026-05-15 09:38:05.204505	multi_account_device	1
41	211-01850	dev-w34ij21xv	success	2026-05-15 09:38:27.428068	multi_account_device	1
42	211-01850	dev-w34ij21xv	success	2026-05-15 09:38:43.816129	multi_account_device	1
43	211-01850	dev-w34ij21xv	success	2026-05-15 09:45:20.247775	multi_account_device	1
44	211-01850	dev-w34ij21xv	success	2026-05-15 09:51:39.027929	multi_account_device	1
45	211-01850	dev-w34ij21xv	success	2026-05-15 09:52:14.905557	multi_account_device	1
\.


--
-- TOC entry 5197 (class 0 OID 41285)
-- Dependencies: 228
-- Data for Name: share_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.share_tokens (id, token, student_id, created_at) FROM stdin;
1	ec42c933537adaeec46293ad5a5dcea24a93f8cdb97548fb	234-23423	2026-04-24 07:46:37.472764
2	d4cfd11ad86fc261a8b910320f182d1c3fd49e54a7ddbfdd	123-12312	2026-04-24 07:47:53.900402
\.


--
-- TOC entry 5199 (class 0 OID 41295)
-- Dependencies: 230
-- Data for Name: signup_pending; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.signup_pending (id, first_name, middle_name, last_name, email, password, "StudentId", course, school_id_image, signup_otp, signup_otp_expires_at, failed_signup_attempts, signup_locked_until, created_at, email_verified, account_status, policy_accepted, policy_version, policy_accepted_at, rejected_reason, rejected_at, rejected_by) FROM stdin;
331	Roxanne	None	Canon	roxanne.canon@carsu.edu.ph	$2b$10$pSCl0Z0LFFtJcjSyxjZ/h.ocKRlE12NDs0b7lA80hTISDrIVzOF1i	221-11111	BACHELOR OF SCIENCE IN AGROFORESTRY	https://ict-library-office-backend.onrender.com/uploads/school-ids/221-11111-school-id.jpg	MIGRATED_PENDING_USER	2026-05-24 11:52:44.627877	0	\N	2026-05-24 11:47:44.627877	t	PENDING	f	\N	\N	\N	\N	\N
333	Rc Jimce	Azura	Dultra	rcjimce.dultra@carsu.edu.ph	$2b$10$uluffrFdEDeqi9nlMX9GI.51Z0DvB4RJ80v2BsrZiEbdOkmJhxE76	221-00364	BACHELOR OF SCIENCE IN FOOD TECHNOLOGY	https://ict-library-office-backend.onrender.com/uploads/school-ids/221-00364-school-id.jpg	MIGRATED_PENDING_USER	2026-05-24 11:52:44.627877	0	\N	2026-05-24 11:47:44.627877	t	PENDING	f	\N	\N	\N	\N	\N
336	Ella	Taran	Freya	12345@carsu.edu.ph	$2b$10$/5rkqlN8Igpeu2gAYrxEb.bdL8iZBlVLLfB8tRQNLN5NklpjSnapu	123-45123	BACHELOR OF SCIENCE IN INFORMATION SYSTEM	NO_IMAGE	MIGRATED_PENDING_USER	2026-05-24 11:52:44.627877	0	\N	2026-05-24 11:47:44.627877	t	PENDING	f	\N	\N	\N	\N	\N
337	Zsh	Ryss	II	zxc@carsu.edu.ph	$2b$10$yD7TbZl7DGuuuwP1ytei2.erczu7/DbkyncLvk2FhoMY8RNpSZDNu	888-88888	BACHELOR OF SCIENCE IN INFORMATION SYSTEM	NO_IMAGE	MIGRATED_PENDING_USER	2026-05-24 11:52:44.627877	0	\N	2026-05-24 11:47:44.627877	t	PENDING	f	\N	\N	\N	\N	\N
330	I	AM	AMAZING	amazing@carsu.edu.ph	$2b$10$M82b150CsQ.NigRRurWoYOFeWeLOEVSmkPgHp1gf6BP7/O.Pgk8LK	211-01870	MASTER IN ENVIRONMENTAL MANAGEMENT	http://localhost:4000/uploads/school-ids/211-01870-school-id.jpg	MIGRATED_PENDING_USER	2026-05-24 11:52:44.627877	0	\N	2026-05-24 11:47:44.627877	t	REJECTED	f	\N	\N	\N	\N	\N
329	The Great 	D	Thunder	the.greatd@carsu.edu.ph	$2b$10$jDXazg2t52pFP2Y0RUvDnejle/rjlsXO2CgUlbSJZ2NVvQNPnOZGm	211-01862	BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRONOMY	https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01862-school-id.png	MIGRATED_PENDING_USER	2026-05-24 11:52:44.627877	0	\N	2026-05-24 11:47:44.627877	t	REJECTED	f	\N	\N	\N	\N	\N
328	Leon	Kennedy	MVP	leon.kennedy@carsu.edu.ph	$2b$10$Pr2xg4kLYKTM8g/uGB6bUOPME5b2T0mj5JfylxSFMYlfi7mwDxZXu	211-01861	BACHELOR OF ELEMENTARY EDUCATION	https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01861-school-id.png	MIGRATED_PENDING_USER	2026-05-24 11:52:44.627877	0	\N	2026-05-24 11:47:44.627877	t	REJECTED	f	\N	\N	\N	\N	\N
332	Kyss Centaur	Montecalvo	Fuentes	kyss.montecalvo@carsu.edu.ph	$2b$10$orEe.7M7fyak9QaMS5u3Ce3oMG22QAlWuSad4oZ7zsGLoU3s7o3au	211-01890	BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRONOMY	http://localhost:4000/uploads/school-ids/211-01890-school-id.jpg	MIGRATED_PENDING_USER	2026-05-24 11:52:44.627877	0	\N	2026-05-24 11:47:44.627877	t	REJECTED	f	\N	\N	\N	\N	\N
327	Resident	Evil	Requiem	resident.evil@carsu.edu.ph	$2b$10$G40sbUxbjhAoeoWM8xad8.3eKPsrjTW.GiUPMbSp7A0Tw1GTjDOjy	211-01860	BACHELOR OF ARTS IN SOCIOLOGY	https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01860-profile-picture.png	MIGRATED_PENDING_USER	2026-05-24 11:52:44.627877	0	\N	2026-05-24 11:47:44.627877	t	REJECTED	f	\N	\N	Ampangit mo kasi. Hahahaha	2026-05-24 14:16:37.871556	7
\.


--
-- TOC entry 5206 (class 0 OID 41402)
-- Dependencies: 237
-- Data for Name: sync_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sync_queue (id, table_name, operation, payload, synced, retry_count, last_error, created_at, synced_at, failed, error_message) FROM stdin;
2	signup_pending	insert	{"id": 40, "email": "leon.kennedy@carsu.edu.ph", "course": "BACHELOR OF ELEMENTARY EDUCATION", "password": "$2b$10$Pr2xg4kLYKTM8g/uGB6bUOPME5b2T0mj5JfylxSFMYlfi7mwDxZXu", "StudentId": "211-01861", "last_name": "MVP", "created_at": "2026-05-22T09:26:13.300459", "first_name": "Leon", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "Kennedy", "account_status": "PENDING", "email_verified": true, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01861-school-id.png", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
3	signup_pending	insert	{"id": 41, "email": "the.greatd@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRONOMY", "password": "$2b$10$jDXazg2t52pFP2Y0RUvDnejle/rjlsXO2CgUlbSJZ2NVvQNPnOZGm", "StudentId": "211-01862", "last_name": "Thunder", "created_at": "2026-05-22T09:26:13.300459", "first_name": "The Great ", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "D", "account_status": "PENDING", "email_verified": true, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01862-school-id.png", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
4	signup_pending	insert	{"id": 42, "email": "amazing@carsu.edu.ph", "course": "MASTER IN ENVIRONMENTAL MANAGEMENT", "password": "$2b$10$M82b150CsQ.NigRRurWoYOFeWeLOEVSmkPgHp1gf6BP7/O.Pgk8LK", "StudentId": "211-01870", "last_name": "AMAZING", "created_at": "2026-05-22T09:26:13.300459", "first_name": "I", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "AM", "account_status": "PENDING", "email_verified": true, "school_id_image": "http://localhost:4000/uploads/school-ids/211-01870-school-id.jpg", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
5	signup_pending	insert	{"id": 43, "email": "roxanne.canon@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN AGROFORESTRY", "password": "$2b$10$pSCl0Z0LFFtJcjSyxjZ/h.ocKRlE12NDs0b7lA80hTISDrIVzOF1i", "StudentId": "221-11111", "last_name": "Canon", "created_at": "2026-05-22T09:26:13.300459", "first_name": "Roxanne", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "None", "account_status": "PENDING", "email_verified": true, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/221-11111-school-id.jpg", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
6	signup_pending	insert	{"id": 44, "email": "kyss.montecalvo@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRONOMY", "password": "$2b$10$orEe.7M7fyak9QaMS5u3Ce3oMG22QAlWuSad4oZ7zsGLoU3s7o3au", "StudentId": "211-01890", "last_name": "Fuentes", "created_at": "2026-05-22T09:26:13.300459", "first_name": "Kyss Centaur", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "Montecalvo", "account_status": "PENDING", "email_verified": true, "school_id_image": "http://localhost:4000/uploads/school-ids/211-01890-school-id.jpg", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
7	signup_pending	insert	{"id": 45, "email": "rcjimce.dultra@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN FOOD TECHNOLOGY", "password": "$2b$10$uluffrFdEDeqi9nlMX9GI.51Z0DvB4RJ80v2BsrZiEbdOkmJhxE76", "StudentId": "221-00364", "last_name": "Dultra", "created_at": "2026-05-22T09:26:13.300459", "first_name": "Rc Jimce", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "Azura", "account_status": "PENDING", "email_verified": true, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/221-00364-school-id.jpg", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
8	signup_pending	insert	{"id": 46, "email": "123@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN INFORMATION SYSTEM", "password": "$2b$10$bpuoQOeHxgcq3lEt5qmoE.KIliQzYc5iTOS0ZSirwJEQY90LHE40O", "StudentId": "123-12312", "last_name": "Claros", "created_at": "2026-05-22T09:26:13.300459", "first_name": "Liezyl Jane", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "Felias", "account_status": "PENDING", "email_verified": true, "school_id_image": "NO_SCHOOL_ID_UPLOADED", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
9	signup_pending	insert	{"id": 47, "email": "234@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN INFORMATION SYSTEM", "password": "$2b$10$Ztl33XUvt9bPeCpb2JcrROnjjalG2FGFWxGflr1ahnxcL3Hv0eyJu", "StudentId": "234-23423", "last_name": "Claros", "created_at": "2026-05-22T09:26:13.300459", "first_name": "Mabell", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "Azura", "account_status": "PENDING", "email_verified": true, "school_id_image": "NO_SCHOOL_ID_UPLOADED", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
10	signup_pending	insert	{"id": 48, "email": "12345@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN INFORMATION SYSTEM", "password": "$2b$10$/5rkqlN8Igpeu2gAYrxEb.bdL8iZBlVLLfB8tRQNLN5NklpjSnapu", "StudentId": "123-45123", "last_name": "Freya", "created_at": "2026-05-22T09:26:13.300459", "first_name": "Ella", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "Taran", "account_status": "PENDING", "email_verified": true, "school_id_image": "NO_SCHOOL_ID_UPLOADED", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
11	signup_pending	insert	{"id": 49, "email": "zxc@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN INFORMATION SYSTEM", "password": "$2b$10$yD7TbZl7DGuuuwP1ytei2.erczu7/DbkyncLvk2FhoMY8RNpSZDNu", "StudentId": "888-88888", "last_name": "II", "created_at": "2026-05-22T09:26:13.300459", "first_name": "Zsh", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "Ryss", "account_status": "PENDING", "email_verified": true, "school_id_image": "NO_SCHOOL_ID_UPLOADED", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
66	password_resets	insert	{"id": 17, "user_id": 7, "otp_hash": "bcc4fb6abbcf1fcdcf4880208c45474e0fda474ffc464eb79c7cb8dd4c691ef8", "created_at": "2026-05-24T09:36:01.799Z", "updated_at": "2026-05-24T09:36:01.799Z", "otp_expires_at": "2026-05-24T09:41:01.799Z"}	t	0	\N	2026-05-24 17:36:01.799812	2026-05-24 17:36:03.696292	f	\N
1	signup_pending	insert	{"id": 39, "email": "resident.evil@carsu.edu.ph", "course": "BACHELOR OF ARTS IN SOCIOLOGY", "password": "$2b$10$G40sbUxbjhAoeoWM8xad8.3eKPsrjTW.GiUPMbSp7A0Tw1GTjDOjy", "StudentId": "211-01860", "last_name": "Requiem", "created_at": "2026-05-22T09:26:13.300459", "first_name": "Resident", "signup_otp": "MIGRATED_PENDING_USER", "middle_name": "Evil", "account_status": "PENDING", "email_verified": true, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01860-profile-picture.png", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T09:31:13.300459", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 09:42:22.63124	\N	f	\N
12	signup_pending	insert	{"id": 50, "email": "kysscentaur.fuentes@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN ARCHITECTURE", "password": "$2b$10$EPgR.c2yQuoOpcjvoZG/6OUgKO0YbZ.3isiih.5hvD.dMnBUICZ7i", "StudentId": "211-01820", "last_name": "Fuentes", "created_at": "2026-05-22T11:53:38.355Z", "first_name": "Kyss Centaur", "signup_otp": "ba072e90e1ecfeae778eb462249731be03f8a13ff1e5cd223da23d713d6a2bdc", "middle_name": "Fumar", "account_status": "PENDING", "email_verified": false, "school_id_image": "http://localhost:4000/uploads/temporary school-ids/211-01820-temporary-school-id.jpg", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-22T11:58:38.355Z", "failed_signup_attempts": 0}	t	0	\N	2026-05-22 19:53:38.373151	\N	f	\N
13	signup_pending	update	{"id": 50, "account_status": "PENDING", "email_verified": true, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01820-school-id.jpg"}	t	0	\N	2026-05-22 19:54:25.3393	\N	f	\N
15	signup_pending	delete	{"id": 50}	t	0	\N	2026-05-22 20:37:19.399436	\N	f	\N
68	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T09:37:26.267Z", "forgot_locked_until": null, "failed_forgot_attempts": 0}	t	0	\N	2026-05-24 17:37:26.268579	2026-05-24 17:37:28.389895	f	\N
69	users	update	{"id": 7, "password": "$2b$10$yTb8eO18L.rWTWMESFk7a.RlzlheCWsF9BkQ6lExK4e9hGSdAaBeO"}	t	0	\N	2026-05-24 17:38:04.111275	2026-05-24 17:38:08.382656	f	\N
70	password_resets	delete	{"user_id": 7}	t	0	\N	2026-05-24 17:38:04.11242	2026-05-24 17:38:08.451732	f	\N
71	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T09:38:04.112Z", "forgot_locked_until": null, "failed_forgot_attempts": 0}	t	0	\N	2026-05-24 17:38:04.112752	2026-05-24 17:38:08.524006	f	\N
67	password_resets	insert	{"id": 17, "user_id": 7, "otp_hash": "25dc0d4d236ce0247766042f598ff87093e5073faa0242ba1dced9d22b6e8471", "created_at": "2026-05-24T09:36:01.799Z", "updated_at": "2026-05-24T09:36:38.160Z", "otp_expires_at": "2026-05-24T09:41:38.160Z"}	t	18	\N	2026-05-24 17:36:38.161654	2026-05-24 17:38:12.458783	f	\N
18	signup_pending	update	{"id": 52, "account_status": "PENDING", "email_verified": true, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01820-school-id.jpg"}	t	0	\N	2026-05-23 12:35:49.239352	\N	f	\N
14	users	insert	{"id": 24, "age": null, "role": "Student", "email": "kysscentaur.fuentes@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN ARCHITECTURE", "gender": null, "suffix": null, "program": null, "password": "$2b$10$EPgR.c2yQuoOpcjvoZG/6OUgKO0YbZ.3isiih.5hvD.dMnBUICZ7i", "StudentId": "211-01820", "birthdate": null, "dark_mode": false, "last_name": "Fuentes", "first_name": "Kyss Centaur", "year_level": null, "middle_name": "Fumar", "nationality": "Filipino", "phone_number": null, "student_type": null, "gender_locked": false, "suffix_locked": false, "account_status": "APPROVED", "two_factor_otp": null, "profile_picture": null, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01820-school-id.jpg", "birthdate_locked": false, "last_otp_sent_at": null, "otp_locked_until": null, "two_factor_secret": null, "vibration_enabled": true, "college_department": null, "login_locked_until": null, "nationality_locked": false, "two_factor_enabled": false, "failed_otp_attempts": 0, "forgot_locked_until": null, "forgot_password_otp": null, "user_classification": null, "forgot_request_count": 0, "two_factor_confirmed": false, "failed_login_attempts": 0, "failed_forgot_attempts": 0, "forgot_request_last_ip": null, "two_factor_temp_secret": null, "two_factor_backup_codes": null, "two_factor_otp_expires_at": null, "forgot_request_last_sent_at": null, "forgot_request_locked_until": null, "change_password_locked_until": null, "forgot_password_otp_expires_at": null, "failed_change_password_attempts": 0}	t	336	\N	2026-05-22 20:37:19.398668	\N	f	\N
16	signup_pending	insert	{"id": 51, "email": "kysscentaur.fuentes@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN CROP PROTECTION", "password": "$2b$10$oB48YHXEahyJIsKGDUwxP.brx85ejVZP8hlKvUKuLF7yJEkkUMX5u", "StudentId": "211-01820", "last_name": "Fuentes", "created_at": "2026-05-23T04:01:09.175Z", "first_name": "Kyss Centaur", "signup_otp": "2dfe59fd5c6f08b49b3adfa5d96c66b20ec142d4ccf1088773ecc532fed01ea4", "middle_name": "Fumar", "account_status": "PENDING", "email_verified": false, "school_id_image": "http://localhost:4000/uploads/temporary school-ids/211-01820-temporary-school-id.jpg", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-23T04:06:09.175Z", "failed_signup_attempts": 0}	t	10	\N	2026-05-23 12:01:09.185371	\N	f	\N
17	signup_pending	insert	{"id": 52, "email": "kysscentaur.fuentes@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN APPLIED MATHEMATICS", "password": "$2b$10$LoE1LDsYpeFspdEmTlVeduUa7l2uDw.AjRnQD0XRovDifoLvz1TAe", "StudentId": "211-01820", "last_name": "Fuentes", "created_at": "2026-05-23T04:35:30.123Z", "first_name": "Kyss Centaur", "signup_otp": "1f8d2fa916d0599dff1a854519840a727bd0f8f8a4ce9c6de73d5f4797a245c8", "middle_name": "Fumar", "account_status": "PENDING", "email_verified": false, "school_id_image": "http://localhost:4000/uploads/temporary school-ids/211-01820-temporary-school-id.jpg", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-23T04:40:30.123Z", "failed_signup_attempts": 0}	t	0	\N	2026-05-23 12:35:30.125409	\N	f	\N
19	users	insert	{"id": 25, "age": null, "role": "Student", "email": "kysscentaur.fuentes@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN APPLIED MATHEMATICS", "gender": null, "suffix": null, "program": null, "password": "$2b$10$LoE1LDsYpeFspdEmTlVeduUa7l2uDw.AjRnQD0XRovDifoLvz1TAe", "StudentId": "211-01820", "birthdate": null, "dark_mode": false, "last_name": "Fuentes", "first_name": "Kyss Centaur", "year_level": null, "middle_name": "Fumar", "nationality": "Filipino", "phone_number": null, "student_type": null, "gender_locked": false, "suffix_locked": false, "account_status": "APPROVED", "two_factor_otp": null, "profile_picture": null, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01820-school-id.jpg", "birthdate_locked": false, "last_otp_sent_at": null, "otp_locked_until": null, "two_factor_secret": null, "vibration_enabled": true, "college_department": null, "login_locked_until": null, "nationality_locked": false, "two_factor_enabled": false, "failed_otp_attempts": 0, "forgot_locked_until": null, "forgot_password_otp": null, "user_classification": null, "forgot_request_count": 0, "two_factor_confirmed": false, "failed_login_attempts": 0, "failed_forgot_attempts": 0, "forgot_request_last_ip": null, "two_factor_temp_secret": null, "two_factor_backup_codes": null, "two_factor_otp_expires_at": null, "forgot_request_last_sent_at": null, "forgot_request_locked_until": null, "change_password_locked_until": null, "forgot_password_otp_expires_at": null, "failed_change_password_attempts": 0}	t	0	\N	2026-05-23 12:36:26.959364	\N	f	\N
20	signup_pending	delete	{"id": 52}	t	0	\N	2026-05-23 12:36:26.960034	\N	f	\N
21	password_resets	update	{"id": 9, "user_id": 25, "otp_hash": "d100b270b27851d4f4c2a56f3c9fca6b3563831934400760c229446ac9498787", "created_at": "2026-05-23T05:13:44.004Z", "updated_at": "2026-05-23T06:49:04.935Z", "otp_expires_at": "2026-05-23T06:54:04.935Z"}	t	0	\N	2026-05-23 14:49:04.936399	\N	f	\N
22	signup_pending	insert	{"id": 53, "email": "kysscentaur.fuentes@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN HORTICULTURE", "password": "$2b$10$AHOnp/MI4ZbGL0L4lrNwo.5Og6CoLTJZ2mG6Q3ftKg1GbNUJQ/a0y", "StudentId": "211-01820", "last_name": "Fuentes", "created_at": "2026-05-23T09:31:56.263Z", "first_name": "Kyss Centaur", "signup_otp": "42449edfe76fb712712bec83e297d5fcd8925a8344885fa6cec55e1090757911", "middle_name": "Fumar", "account_status": "PENDING", "email_verified": false, "policy_version": "v1.0", "policy_accepted": true, "school_id_image": "http://localhost:4000/uploads/temporary school-ids/211-01820-temporary-school-id.png", "policy_accepted_at": "2026-05-23T09:31:56.263Z", "signup_locked_until": null, "signup_otp_expires_at": "2026-05-23T09:36:56.263Z", "failed_signup_attempts": 0}	t	0	\N	2026-05-23 17:31:56.277522	\N	f	\N
23	signup_pending	update	{"id": 53, "account_status": "PENDING", "email_verified": true, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01820-school-id.png"}	t	0	\N	2026-05-23 17:32:16.926765	\N	f	\N
24	users	insert	{"id": 26, "age": null, "role": "Student", "email": "kysscentaur.fuentes@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN HORTICULTURE", "gender": null, "suffix": null, "program": null, "password": "$2b$10$AHOnp/MI4ZbGL0L4lrNwo.5Og6CoLTJZ2mG6Q3ftKg1GbNUJQ/a0y", "StudentId": "211-01820", "birthdate": null, "dark_mode": false, "last_name": "Fuentes", "first_name": "Kyss Centaur", "year_level": null, "middle_name": "Fumar", "nationality": "Filipino", "phone_number": null, "student_type": null, "gender_locked": false, "suffix_locked": false, "account_status": "APPROVED", "policy_version": "v1.0", "two_factor_otp": null, "policy_accepted": true, "profile_picture": null, "school_id_image": "https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01820-school-id.png", "birthdate_locked": false, "last_otp_sent_at": null, "otp_locked_until": null, "two_factor_secret": null, "vibration_enabled": true, "college_department": null, "login_locked_until": null, "nationality_locked": false, "policy_accepted_at": "2026-05-23T09:31:56.263Z", "two_factor_enabled": false, "failed_otp_attempts": 0, "forgot_locked_until": null, "forgot_password_otp": null, "user_classification": null, "forgot_request_count": 0, "two_factor_confirmed": false, "failed_login_attempts": 0, "failed_forgot_attempts": 0, "forgot_request_last_ip": null, "two_factor_temp_secret": null, "two_factor_backup_codes": null, "two_factor_otp_expires_at": null, "forgot_request_last_sent_at": null, "forgot_request_locked_until": null, "change_password_locked_until": null, "forgot_password_otp_expires_at": null, "failed_change_password_attempts": 0}	t	0	\N	2026-05-23 17:40:23.948659	\N	f	\N
25	signup_pending	delete	{"id": 53}	t	0	\N	2026-05-23 17:40:23.952044	\N	f	\N
26	policy_acceptance_history	insert	{"id": 4, "user_id": 26, "ip_address": "127.0.0.1", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "accepted_at": "2026-05-23T13:39:14.825Z", "evidence_hash": "c023bbe0ecc2396d0a63caabc26a9c749122703ba9c1c9879791eb6b9eedf1f5", "policy_version": "v1.5", "acceptance_source": null}	t	0	\N	2026-05-23 21:39:14.828064	2026-05-23 21:39:19.017539	f	\N
27	policy_acceptance_history	insert	{"id": 5, "user_id": 26, "ip_address": "127.0.0.1", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "accepted_at": "2026-05-23T15:24:09.007Z", "evidence_hash": "0618eae074a72f33196e6f77194890e19b18911348ebd1ccc63a38380848e0d5", "policy_version": "v1.6", "acceptance_source": null}	t	0	\N	2026-05-23 23:24:09.012844	2026-05-23 23:24:16.422641	f	\N
28	policy_acceptance_history	insert	{"id": 6, "user_id": 26, "ip_address": "127.0.0.1", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "accepted_at": "2026-05-24T02:31:46.325Z", "evidence_hash": "b3a27494cdc169e9134eb7a5c267b1d257aacf3e5ddd714f5d27fe3c038cbc11", "policy_version": "v1.7", "acceptance_source": null}	t	0	\N	2026-05-24 10:31:46.63321	2026-05-24 10:31:52.307315	f	\N
29	policy_acceptance_history	insert	{"id": 7, "user_id": 7, "ip_address": "127.0.0.1", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "accepted_at": "2026-05-24T02:38:48.951Z", "evidence_hash": "b95a78dbd494017f00e16ad58b734124bae23d643344a15e8847cb393c72e400", "policy_version": "v1.7", "acceptance_source": null}	t	0	\N	2026-05-24 10:38:48.95356	2026-05-24 10:38:53.341263	f	\N
30	policy_acceptance_history	insert	{"id": 8, "user_id": 3, "ip_address": "127.0.0.1", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "accepted_at": "2026-05-24T02:39:44.933Z", "evidence_hash": "fc88b08eb4b9e359fadc8b886e5ae8b89016a2b1127534d5582240a588ee737f", "policy_version": "v1.7", "acceptance_source": null}	t	0	\N	2026-05-24 10:39:44.934549	2026-05-24 10:39:48.3675	f	\N
31	users	insert	{"id": 30, "age": null, "role": "Student", "email": "234@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN INFORMATION SYSTEM", "gender": null, "suffix": null, "program": null, "password": "$2b$10$Ztl33XUvt9bPeCpb2JcrROnjjalG2FGFWxGflr1ahnxcL3Hv0eyJu", "StudentId": "234-23423", "birthdate": null, "dark_mode": false, "last_name": "Claros", "first_name": "Mabell", "year_level": null, "middle_name": "Azura", "nationality": "Filipino", "phone_number": null, "student_type": null, "gender_locked": false, "suffix_locked": false, "account_status": "APPROVED", "policy_version": null, "two_factor_otp": null, "policy_accepted": false, "profile_picture": null, "school_id_image": "NO_IMAGE", "birthdate_locked": false, "last_otp_sent_at": null, "otp_locked_until": null, "two_factor_secret": null, "vibration_enabled": true, "college_department": null, "login_locked_until": null, "nationality_locked": false, "policy_accepted_at": null, "two_factor_enabled": false, "failed_otp_attempts": 0, "forgot_locked_until": null, "forgot_password_otp": null, "user_classification": null, "forgot_request_count": 0, "two_factor_confirmed": false, "failed_login_attempts": 0, "failed_forgot_attempts": 0, "forgot_request_last_ip": null, "two_factor_temp_secret": null, "two_factor_backup_codes": null, "two_factor_otp_expires_at": null, "forgot_request_last_sent_at": null, "forgot_request_locked_until": null, "change_password_locked_until": null, "forgot_password_otp_expires_at": null, "failed_change_password_attempts": 0}	t	0	\N	2026-05-24 12:43:01.052514	2026-05-24 12:43:07.277168	f	\N
32	signup_pending	delete	{"id": 335}	t	0	\N	2026-05-24 12:43:01.060345	2026-05-24 12:43:07.372345	f	\N
33	signup_pending	update	{"id": 330, "account_status": "REJECTED"}	t	0	\N	2026-05-24 12:44:20.495224	2026-05-24 12:44:24.704138	f	\N
34	signup_pending	update	{"id": 329, "account_status": "REJECTED"}	t	0	\N	2026-05-24 12:44:42.861935	2026-05-24 12:44:44.844953	f	\N
35	signup_pending	update	{"id": 328, "account_status": "REJECTED"}	t	0	\N	2026-05-24 12:44:46.969154	2026-05-24 12:44:49.332615	f	\N
36	password_resets	update	{"id": 7, "user_id": 7, "otp_hash": "f3001789a9d2be612c4e076cddb4418be009c877bea94a353afcabd04eccd9ce", "created_at": "2026-05-22T08:58:59.537Z", "updated_at": "2026-05-24T04:54:03.471Z", "otp_expires_at": "2026-05-24T04:59:03.471Z"}	t	0	\N	2026-05-24 12:54:03.47254	2026-05-24 12:54:11.036519	f	\N
37	policy_acceptance_history	insert	{"id": 1, "user_id": 7, "ip_address": "127.0.0.1", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "accepted_at": "2026-05-24T05:28:06.600Z", "evidence_hash": "ff7adf2bf08918219cc0e01bbc167af415687ba7fb713b75d5ad8522d08ab7dd", "policy_version": "v1.8", "acceptance_source": null}	t	0	\N	2026-05-24 13:28:06.602479	2026-05-24 13:28:09.728818	f	\N
38	password_resets	update	{"id": 12, "user_id": 7, "otp_hash": "385e42c53f07ad6f41c78de5ecfa19ee52be2ba0cdd8cb28c0ca4d68e5869a67", "created_at": "2026-05-24T05:28:54.316Z", "updated_at": "2026-05-24T05:28:54.316Z", "otp_expires_at": "2026-05-24T05:33:54.316Z"}	t	0	\N	2026-05-24 13:28:54.317244	2026-05-24 13:28:58.558901	f	\N
39	users	insert	{"id": 31, "age": null, "role": "Student", "email": "123@carsu.edu.ph", "course": "BACHELOR OF SCIENCE IN INFORMATION SYSTEM", "gender": null, "suffix": null, "program": null, "password": "$2b$10$bpuoQOeHxgcq3lEt5qmoE.KIliQzYc5iTOS0ZSirwJEQY90LHE40O", "StudentId": "123-12312", "birthdate": null, "dark_mode": false, "last_name": "Claros", "first_name": "Liezyl Jane", "year_level": null, "middle_name": "Felias", "nationality": "Filipino", "phone_number": null, "student_type": null, "gender_locked": false, "suffix_locked": false, "account_status": "APPROVED", "policy_version": null, "two_factor_otp": null, "policy_accepted": false, "profile_picture": null, "school_id_image": "NO_IMAGE", "birthdate_locked": false, "last_otp_sent_at": null, "otp_locked_until": null, "two_factor_secret": null, "vibration_enabled": true, "college_department": null, "login_locked_until": null, "nationality_locked": false, "policy_accepted_at": null, "two_factor_enabled": false, "failed_otp_attempts": 0, "forgot_locked_until": null, "forgot_password_otp": null, "user_classification": null, "forgot_request_count": 0, "two_factor_confirmed": false, "failed_login_attempts": 0, "failed_forgot_attempts": 0, "forgot_request_last_ip": null, "two_factor_temp_secret": null, "two_factor_backup_codes": null, "two_factor_otp_expires_at": null, "forgot_request_last_sent_at": null, "forgot_request_locked_until": null, "change_password_locked_until": null, "forgot_password_otp_expires_at": null, "failed_change_password_attempts": 0}	t	0	\N	2026-05-24 13:30:58.115271	2026-05-24 13:30:58.760401	f	\N
40	signup_pending	delete	{"id": 334}	t	0	\N	2026-05-24 13:30:58.11617	2026-05-24 13:30:58.834558	f	\N
41	signup_pending	update	{"id": 332, "account_status": "REJECTED"}	t	0	\N	2026-05-24 13:31:10.995282	2026-05-24 13:31:13.771024	f	\N
42	signup_pending	update	{"id": 327, "rejected_at": "2026-05-24T06:16:37.871Z", "rejected_by": 7, "account_status": "REJECTED", "rejected_reason": "Ampangit mo kasi. Hahahaha"}	t	0	\N	2026-05-24 14:16:37.87272	2026-05-24 14:16:44.352195	f	\N
43	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T07:50:18.960Z", "login_locked_until": "2026-05-24T07:50:48.960Z", "failed_login_attempts": 6}	t	0	\N	2026-05-24 15:50:18.961828	2026-05-24 15:50:26.379291	f	\N
44	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T08:01:36.280Z", "login_locked_until": null, "failed_login_attempts": 0}	t	0	\N	2026-05-24 16:01:36.28127	2026-05-24 16:01:41.259187	f	\N
45	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T08:12:20.731Z", "login_locked_until": null, "failed_login_attempts": 0}	t	0	\N	2026-05-24 16:12:20.731796	2026-05-24 16:12:23.116869	f	\N
46	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T08:19:07.728Z", "login_locked_until": null, "failed_login_attempts": 0}	t	0	\N	2026-05-24 16:19:07.728745	2026-05-24 16:19:12.520805	f	\N
47	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T08:22:27.238Z", "login_locked_until": null, "failed_login_attempts": 0}	t	0	\N	2026-05-24 16:22:27.238814	2026-05-24 16:22:32.534627	f	\N
48	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T08:24:11.064Z", "login_locked_until": null, "failed_login_attempts": 1}	t	0	\N	2026-05-24 16:24:11.06588	2026-05-24 16:24:12.788464	f	\N
49	password_resets	update	{"id": 13, "user_id": 7, "otp_hash": "30a79055304a9816ae63c610994c9a103c5284cddbd9f4031344a3d56d93f041", "created_at": "2026-05-24T08:39:27.740Z", "updated_at": "2026-05-24T08:39:27.740Z", "otp_expires_at": "2026-05-24T08:44:27.740Z"}	t	0	\N	2026-05-24 16:39:27.743376	2026-05-24 16:39:29.958087	f	\N
50	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T08:39:55.309Z", "forgot_locked_until": null, "failed_forgot_attempts": 0}	t	0	\N	2026-05-24 16:39:55.310006	2026-05-24 16:39:59.175808	f	\N
51	password_resets	update	{"id": 14, "user_id": 7, "otp_hash": "5b8a7a07ebacbcfc28d80fcbb6b7229c7960ac5830c2b1e726ca3a99aa6b85e9", "created_at": "2026-05-24T08:56:27.539Z", "updated_at": "2026-05-24T08:56:27.539Z", "otp_expires_at": "2026-05-24T09:01:27.539Z"}	t	0	\N	2026-05-24 16:56:27.540366	2026-05-24 16:56:30.871873	f	\N
52	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T08:56:46.862Z", "forgot_locked_until": null, "failed_forgot_attempts": 0}	t	0	\N	2026-05-24 16:56:46.862908	2026-05-24 16:56:50.858309	f	\N
53	users	update	{"id": 7, "password": "$2b$10$fF3uGm2CovxyS6LuC7YgvuBbgrzHA0N3KOyUAn0H2dfmnP1iIE6nm"}	t	0	\N	2026-05-24 16:57:00.407005	2026-05-24 16:57:05.855324	f	\N
54	password_resets	delete	{"user_id": 7}	t	0	\N	2026-05-24 16:57:00.408127	2026-05-24 16:57:05.924035	f	\N
55	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T08:57:00.408Z", "forgot_locked_until": null, "failed_forgot_attempts": 0}	t	0	\N	2026-05-24 16:57:00.408473	2026-05-24 16:57:05.992205	f	\N
56	password_resets	insert	{"id": 15, "user_id": 7, "otp_hash": "c026edd972d577f4ca63a4f02dbac2f890d126f86b1ec03807bab81794825a0c", "created_at": "2026-05-24T09:18:47.133Z", "updated_at": "2026-05-24T09:18:47.133Z", "otp_expires_at": "2026-05-24T09:23:47.133Z"}	t	0	\N	2026-05-24 17:18:47.134747	2026-05-24 17:18:53.255758	f	\N
57	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T09:19:07.028Z", "forgot_locked_until": null, "failed_forgot_attempts": 0}	t	0	\N	2026-05-24 17:19:07.029324	2026-05-24 17:19:12.447725	f	\N
58	users	update	{"id": 7, "password": "$2b$10$nE4bbR5bh0GR0mlSvhMH1.RPFX3wejxePmS8Pra7Yg187lyXnmH/a"}	t	0	\N	2026-05-24 17:19:18.377045	2026-05-24 17:19:22.056373	f	\N
59	password_resets	delete	{"user_id": 7}	t	0	\N	2026-05-24 17:19:18.377928	2026-05-24 17:19:22.151466	f	\N
60	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T09:19:18.377Z", "forgot_locked_until": null, "failed_forgot_attempts": 0}	t	0	\N	2026-05-24 17:19:18.378197	2026-05-24 17:19:22.227675	f	\N
61	password_resets	insert	{"id": 16, "user_id": 7, "otp_hash": "eb9236adcc72918a49d26790e445764ebf9b7c64a27a64c0a17ec57426d61566", "created_at": "2026-05-24T09:28:52.614Z", "updated_at": "2026-05-24T09:28:52.614Z", "otp_expires_at": "2026-05-24T09:33:52.614Z"}	t	0	\N	2026-05-24 17:28:52.615831	2026-05-24 17:28:57.95929	f	\N
62	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T09:29:08.819Z", "forgot_locked_until": null, "failed_forgot_attempts": 0}	t	0	\N	2026-05-24 17:29:08.819466	2026-05-24 17:29:12.788289	f	\N
63	users	update	{"id": 7, "password": "$2b$10$ZUO6Y0r2Wi4swPH.b7H9geCztsxjXFS2d0/wxgpWk0laJH7Ceyn9C"}	t	0	\N	2026-05-24 17:29:17.648462	2026-05-24 17:29:22.387885	f	\N
64	password_resets	delete	{"user_id": 7}	t	0	\N	2026-05-24 17:29:17.6494	2026-05-24 17:29:22.388512	f	\N
65	user_security	update	{"user_id": 7, "updated_at": "2026-05-24T09:29:17.649Z", "forgot_locked_until": null, "failed_forgot_attempts": 0}	t	0	\N	2026-05-24 17:29:17.649682	2026-05-24 17:29:22.461347	f	\N
\.


--
-- TOC entry 5210 (class 0 OID 49378)
-- Dependencies: 242
-- Data for Name: user_2fa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_2fa (id, user_id, enabled, confirmed, secret, temp_secret, backup_codes, created_at, updated_at) FROM stdin;
8	11	f	f	\N	\N	\N	2026-05-22 12:27:32.753614	2026-05-22 12:27:32.753614
12	3	f	f	\N	\N	\N	2026-05-22 12:27:32.753614	2026-05-22 12:27:32.753614
15	12	f	f	\N	\N	\N	2026-05-22 12:27:32.753614	2026-05-22 12:27:32.753614
17	10	t	t	PF2XUOCJHZYV2NTYLJRW4TLEHJXHQQJWGM2SKYJ4OVUTOSTUJFAQ	\N	{f95b80a7,ce918565,153cd26d,9726826d,810b6783}	2026-05-22 12:27:32.753614	2026-05-22 16:58:34.940081
40	26	f	f	\N	IIUDQ4CRKB4DIM3XKBDDGOSMJU2G42DULMXEIUZ3NNFX2LRRPFGQ	\N	2026-05-23 17:40:23.947848	2026-05-23 23:38:00.094051
42	30	f	f	\N	\N	\N	2026-05-24 12:43:01.051975	2026-05-24 12:43:01.051975
25	7	f	f	\N	\N	\N	2026-05-22 17:36:48.230628	2026-05-24 13:30:43.775841
45	31	f	f	\N	\N	\N	2026-05-24 13:30:58.114741	2026-05-24 13:30:58.114741
\.


--
-- TOC entry 5208 (class 0 OID 49352)
-- Dependencies: 239
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_preferences (id, user_id, dark_mode, vibration_enabled, created_at, updated_at) FROM stdin;
8	11	f	t	2026-05-22 12:03:06.797773	2026-05-22 12:03:06.797773
12	3	f	t	2026-05-22 12:03:06.797773	2026-05-22 12:03:06.797773
15	12	f	t	2026-05-22 12:03:06.797773	2026-05-22 12:03:06.797773
17	10	t	\N	2026-05-22 12:03:06.797773	2026-05-22 12:03:06.797773
13	7	t	t	2026-05-22 12:03:06.797773	2026-05-22 16:26:11.35834
20	26	t	t	2026-05-23 17:40:23.928898	2026-05-23 23:37:59.880003
21	30	f	t	2026-05-24 12:43:01.045233	2026-05-24 12:43:01.045233
22	31	f	t	2026-05-24 13:30:58.100362	2026-05-24 13:30:58.100362
\.


--
-- TOC entry 5214 (class 0 OID 49432)
-- Dependencies: 248
-- Data for Name: user_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profile (id, user_id, suffix, suffix_locked, phone_number, birthdate, birthdate_locked, age, gender, gender_locked, nationality, nationality_locked, user_classification, student_type, college_department, program, year_level, created_at, updated_at) FROM stdin;
8	11	\N	f		2001-01-01	t	25	Prefer not to say	t	American	t	\N	\N	\N	\N	\N	2026-05-22 12:58:18.540091	2026-05-22 12:58:18.540091
12	3	\N	f	\N	\N	f	\N	\N	f	\N	f	\N	\N	\N	\N	\N	2026-05-22 12:58:18.540091	2026-05-22 12:58:18.540091
14	12	\N	f		2002-02-02	t	24	Male	t	Japanese	t	\N	\N	\N	\N	\N	2026-05-22 12:58:18.540091	2026-05-22 12:58:18.540091
16	10	\N	f		2002-05-06	t	\N	Male	t	Filipino	t	\N	\N	\N	\N	\N	2026-05-22 12:58:18.540091	2026-05-22 12:58:18.540091
17	7	Sr.	t	9123123123	2002-05-06	t	\N	Male	t	Filipino	t	\N	\N	\N	\N	\N	2026-05-22 12:58:18.540091	2026-05-22 16:26:11.357251
20	26	\N	f		\N	f	\N	\N	f	Filipino	f	\N	\N	\N	\N	\N	2026-05-23 17:40:23.928044	2026-05-23 23:37:59.877846
21	30	\N	f	\N	\N	f	\N	\N	f	\N	f	\N	\N	\N	\N	\N	2026-05-24 12:43:01.044512	2026-05-24 12:43:01.044512
22	31	\N	f	\N	\N	f	\N	\N	f	\N	f	\N	\N	\N	\N	\N	2026-05-24 13:30:58.099818	2026-05-24 13:30:58.099818
\.


--
-- TOC entry 5212 (class 0 OID 49405)
-- Dependencies: 245
-- Data for Name: user_security; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_security (id, user_id, failed_login_attempts, login_locked_until, failed_otp_attempts, otp_locked_until, failed_forgot_attempts, forgot_locked_until, failed_change_password_attempts, change_password_locked_until, created_at, updated_at) FROM stdin;
22	31	0	\N	0	\N	0	\N	0	\N	2026-05-24 13:30:58.100783	2026-05-24 13:30:58.100783
8	11	0	\N	0	\N	0	\N	0	\N	2026-05-22 12:31:39.507788	2026-05-22 12:39:33.23273
15	12	0	\N	0	\N	0	\N	0	\N	2026-05-22 12:31:39.507788	2026-05-22 12:39:33.23273
17	10	0	\N	0	\N	0	\N	0	\N	2026-05-22 12:31:39.507788	2026-05-22 12:39:33.23273
13	7	1	\N	0	\N	0	\N	0	\N	2026-05-22 12:31:39.507788	2026-05-24 17:38:04.111958
12	3	0	\N	0	\N	0	\N	0	\N	2026-05-22 12:31:39.507788	2026-05-24 10:39:39.258753
21	30	0	\N	0	\N	0	\N	0	\N	2026-05-24 12:43:01.045682	2026-05-24 12:43:01.045682
20	26	1	\N	0	\N	0	\N	0	\N	2026-05-23 17:40:23.929478	2026-05-24 10:32:31.136303
\.


--
-- TOC entry 5201 (class 0 OID 41313)
-- Dependencies: 232
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, password, "StudentId", role, course, email, first_name, middle_name, last_name, school_id_image, suffix, suffix_locked, phone_number, year_level, profile_picture, birthdate, age, gender, nationality, user_classification, student_type, college_department, program, birthdate_locked, gender_locked, nationality_locked, vibration_enabled, dark_mode, two_factor_enabled, two_factor_otp, two_factor_otp_expires_at, failed_login_attempts, login_locked_until, failed_otp_attempts, otp_locked_until, last_otp_sent_at, account_status, forgot_password_otp, forgot_password_otp_expires_at, failed_forgot_attempts, forgot_locked_until, failed_change_password_attempts, change_password_locked_until, forgot_request_count, forgot_request_locked_until, forgot_request_last_ip, forgot_request_last_sent_at, two_factor_secret, two_factor_backup_codes, two_factor_temp_secret, two_factor_confirmed, policy_accepted, policy_version, policy_accepted_at) FROM stdin;
11	$2b$10$uwrjAKxbhl2AAX8G7ETwfe4u.Lr.r6NI/aA6SNETySTL7mXDgHOMW	211-01852	Student	BACHELOR OF SCIENCE IN AGRICULTURAL AND BIOSYSTEMS ENGINEERING	asd@carsu.edu.ph	asd	asdd	asdas	https://dioxide-gibberish-enforcer.ngrok-free.dev/uploads/1778641302706.jpg	\N	f		\N	\N	2001-01-01	25	Prefer not to say	American	\N	\N	\N	\N	t	t	t	t	f	f	\N	\N	1	\N	0	\N	\N	REJECTED	dc097e93445cb0c036e600dfe7fed59e87e30910cfed28eb01a77977ebe3c783	2026-05-20 11:01:15.830991	0	\N	0	\N	0	\N	\N	\N	\N	\N	\N	f	f	\N	\N
30	$2b$10$Ztl33XUvt9bPeCpb2JcrROnjjalG2FGFWxGflr1ahnxcL3Hv0eyJu	234-23423	Student	BACHELOR OF SCIENCE IN INFORMATION SYSTEM	234@carsu.edu.ph	Mabell	Azura	Claros	NO_IMAGE	\N	f	\N	\N	\N	\N	\N	\N	Filipino	\N	\N	\N	\N	f	f	f	t	f	f	\N	\N	0	\N	0	\N	\N	APPROVED	\N	\N	0	\N	0	\N	0	\N	\N	\N	\N	\N	\N	f	f	\N	\N
7	$2b$10$yTb8eO18L.rWTWMESFk7a.RlzlheCWsF9BkQ6lExK4e9hGSdAaBeO	211-01850	Admin	BACHELOR OF SCIENCE IN INFORMATION SYSTEM	kyss.fuentes1@gmail.com	Kyss Centaur	Fumar	Fuentes	https://dioxide-gibberish-enforcer.ngrok-free.dev/uploads/1778638426459.jpg	Sr.	t	9123123123	\N	http://localhost:4000/uploads/profile-pictures/211-01850-profile-picture.jpg	2002-05-06	\N	Male	Filipino	\N	\N	\N	\N	t	t	t	t	t	f	\N	\N	0	\N	0	\N	\N	APPROVED	9f1a0ea3f388ae54f10ce71b8ede215ee17334b5eae582feb20b03249e8fd5ef	2026-05-22 15:04:47.555683	0	\N	0	\N	1	\N	\N	2026-05-20 15:03:24.670949	JFWHQVBKHREVWOT3KFDG6RZKJFHUUSKUOB4C6PSPKJCXUXKXMJNQ	{7e5854f0,01b6b4d1,d5a6695d,9b593905,c9c0711e}	\N	t	t	v1.8	2026-05-24 13:28:06.600438
31	$2b$10$bpuoQOeHxgcq3lEt5qmoE.KIliQzYc5iTOS0ZSirwJEQY90LHE40O	123-12312	Student	BACHELOR OF SCIENCE IN INFORMATION SYSTEM	123@carsu.edu.ph	Liezyl Jane	Felias	Claros	NO_IMAGE	\N	f	\N	\N	\N	\N	\N	\N	Filipino	\N	\N	\N	\N	f	f	f	t	f	f	\N	\N	0	\N	0	\N	\N	APPROVED	\N	\N	0	\N	0	\N	0	\N	\N	\N	\N	\N	\N	f	f	\N	\N
12	$2b$10$aP5VSh6D9abmKtIe5SaqwOzQ64jLs/08Fl0IgDT4xudHFzlduOBB2	211-01853	Student	BACHELOR OF SCIENCE IN AGRICULTURE	asddsa@carsu.edu.ph	I can	Be Great	Once again	https://dioxide-gibberish-enforcer.ngrok-free.dev/uploads/211-01853-school-id.png	\N	f		\N	\N	2002-02-02	24	Male	Japanese	\N	\N	\N	\N	t	t	t	t	f	f	\N	\N	0	\N	0	\N	\N	APPROVED	\N	\N	0	\N	0	\N	0	\N	\N	\N	\N	\N	\N	f	f	\N	\N
10	$2b$10$R3Dp0Tzn6spyv8O.R9dMY.5pIHOS88JF1S39Yxlo66o6TyQelxl4O	211-01851	Student	BACHELOR OF SCIENCE IN INFORMATION SYSTEM	kyss.fuentes3@gmail.com	Kyss	Centaur	Canon	https://dioxide-gibberish-enforcer.ngrok-free.dev/uploads/1778640538173.jpg	\N	f		\N	\N	2002-05-06	\N	Male	Filipino	\N	\N	\N	\N	t	t	t	\N	t	t	e1c170187fd2ea7f2f580b275de0c76ff8def643c1f3839c64b1e2de9dcc9f4b	2026-05-20 08:56:42.995303	0	\N	0	\N	\N	APPROVED	\N	\N	0	\N	0	\N	0	\N	\N	\N	PF2XUOCJHZYV2NTYLJRW4TLEHJXHQQJWGM2SKYJ4OVUTOSTUJFAQ	{f95b80a7,ce918565,153cd26d,9726826d,810b6783}	\N	t	f	\N	\N
3	$2b$10$yD7TbZl7DGuuuwP1ytei2.erczu7/DbkyncLvk2FhoMY8RNpSZDNu	999-99999	Admin	BACHELOR OF SCIENCE IN INFORMATION SYSTEM	kyss.fuentes2@gmail.com	Queenie	None	Siahay	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	t	f	f	\N	\N	0	\N	0	\N	\N	APPROVED	\N	\N	0	\N	0	\N	0	\N	\N	\N	\N	\N	\N	f	t	v1.7	2026-05-24 10:39:44.933135
26	$2b$10$AHOnp/MI4ZbGL0L4lrNwo.5Og6CoLTJZ2mG6Q3ftKg1GbNUJQ/a0y	211-01820	Student	BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN HORTICULTURE	kysscentaur.fuentes@carsu.edu.ph	Kyss Centaur	Fumar	Fuentes	https://ict-library-office-backend.onrender.com/uploads/school-ids/211-01820-school-id.png	\N	f	\N	\N	\N	\N	\N	\N	Filipino	\N	\N	\N	\N	f	f	f	t	f	f	\N	\N	0	\N	0	\N	\N	APPROVED	\N	\N	0	\N	0	\N	0	\N	\N	\N	\N	\N	\N	f	t	v1.7	2026-05-24 10:31:46.324843
\.


--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 221
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_id_seq', 1, false);


--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 254
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 45, true);


--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 234
-- Name: commands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.commands_id_seq', 1, false);


--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 223
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.devices_id_seq', 18177, true);


--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 225
-- Name: forgot_password_security_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.forgot_password_security_id_seq', 4, true);


--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 250
-- Name: password_resets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_resets_id_seq', 18, true);


--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 252
-- Name: policy_acceptance_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.policy_acceptance_history_id_seq', 1, true);


--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 227
-- Name: scan_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scan_logs_id_seq', 45, true);


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 229
-- Name: share_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.share_tokens_id_seq', 2, true);


--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 231
-- Name: signup_pending_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.signup_pending_id_seq', 337, true);


--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 236
-- Name: sync_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sync_queue_id_seq', 71, true);


--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 241
-- Name: user_2fa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_2fa_id_seq', 45, true);


--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 238
-- Name: user_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_preferences_id_seq', 22, true);


--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 247
-- Name: user_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_profile_id_seq', 22, true);


--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 244
-- Name: user_security_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_security_id_seq', 22, true);


--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 233
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 31, true);


--
-- TOC entry 4962 (class 2606 OID 41347)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 5028 (class 2606 OID 49523)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 41400)
-- Name: commands commands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commands
    ADD CONSTRAINT commands_pkey PRIMARY KEY (id);


--
-- TOC entry 4964 (class 2606 OID 41349)
-- Name: devices devices_mac_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_mac_address_key UNIQUE (device_id);


--
-- TOC entry 4966 (class 2606 OID 41351)
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 41353)
-- Name: forgot_password_security forgot_password_security_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forgot_password_security
    ADD CONSTRAINT forgot_password_security_pkey PRIMARY KEY (id);


--
-- TOC entry 5020 (class 2606 OID 49472)
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 2606 OID 49479)
-- Name: password_resets password_resets_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_unique UNIQUE (user_id);


--
-- TOC entry 5024 (class 2606 OID 49499)
-- Name: policy_acceptance_history policy_acceptance_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_acceptance_history
    ADD CONSTRAINT policy_acceptance_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4972 (class 2606 OID 41355)
-- Name: scan_logs scan_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scan_logs
    ADD CONSTRAINT scan_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 41357)
-- Name: share_tokens share_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_tokens
    ADD CONSTRAINT share_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 41359)
-- Name: share_tokens share_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.share_tokens
    ADD CONSTRAINT share_tokens_token_key UNIQUE (token);


--
-- TOC entry 4978 (class 2606 OID 41361)
-- Name: signup_pending signup_pending_StudentId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signup_pending
    ADD CONSTRAINT "signup_pending_StudentId_key" UNIQUE ("StudentId");


--
-- TOC entry 4980 (class 2606 OID 41363)
-- Name: signup_pending signup_pending_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signup_pending
    ADD CONSTRAINT signup_pending_email_key UNIQUE (email);


--
-- TOC entry 4982 (class 2606 OID 41365)
-- Name: signup_pending signup_pending_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signup_pending
    ADD CONSTRAINT signup_pending_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 41416)
-- Name: sync_queue sync_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_queue
    ADD CONSTRAINT sync_queue_pkey PRIMARY KEY (id);


--
-- TOC entry 4984 (class 2606 OID 41367)
-- Name: users unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- TOC entry 5026 (class 2606 OID 49510)
-- Name: policy_acceptance_history unique_policy_history; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_acceptance_history
    ADD CONSTRAINT unique_policy_history UNIQUE (user_id, policy_version);


--
-- TOC entry 4986 (class 2606 OID 41369)
-- Name: users unique_student_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_student_id UNIQUE ("StudentId");


--
-- TOC entry 4988 (class 2606 OID 41371)
-- Name: users unique_studentid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_studentid UNIQUE ("StudentId");


--
-- TOC entry 4990 (class 2606 OID 41373)
-- Name: users unique_users_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_users_email UNIQUE (email);


--
-- TOC entry 4992 (class 2606 OID 41375)
-- Name: users unique_users_studentid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_users_studentid UNIQUE ("StudentId");


--
-- TOC entry 5008 (class 2606 OID 49391)
-- Name: user_2fa user_2fa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_2fa
    ADD CONSTRAINT user_2fa_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 49393)
-- Name: user_2fa user_2fa_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_2fa
    ADD CONSTRAINT user_2fa_user_id_key UNIQUE (user_id);


--
-- TOC entry 5004 (class 2606 OID 49363)
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- TOC entry 5006 (class 2606 OID 49365)
-- Name: user_preferences user_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);


--
-- TOC entry 5016 (class 2606 OID 49447)
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 5018 (class 2606 OID 49449)
-- Name: user_profile user_profile_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_user_id_key UNIQUE (user_id);


--
-- TOC entry 5012 (class 2606 OID 49418)
-- Name: user_security user_security_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_security
    ADD CONSTRAINT user_security_pkey PRIMARY KEY (id);


--
-- TOC entry 5014 (class 2606 OID 49420)
-- Name: user_security user_security_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_security
    ADD CONSTRAINT user_security_user_id_key UNIQUE (user_id);


--
-- TOC entry 4994 (class 2606 OID 41377)
-- Name: users users_StudentId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_StudentId_key" UNIQUE ("StudentId");


--
-- TOC entry 4996 (class 2606 OID 41379)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4998 (class 2606 OID 41381)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 1259 OID 41382)
-- Name: idx_forgot_security_identifier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_forgot_security_identifier ON public.forgot_password_security USING btree (identifier);


--
-- TOC entry 4970 (class 1259 OID 41383)
-- Name: idx_forgot_security_ip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_forgot_security_ip ON public.forgot_password_security USING btree (ip_address);


--
-- TOC entry 5037 (class 2620 OID 49507)
-- Name: policy_acceptance_history policy_history_no_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER policy_history_no_update BEFORE DELETE OR UPDATE ON public.policy_acceptance_history FOR EACH ROW EXECUTE FUNCTION public.prevent_policy_history_modification();


--
-- TOC entry 5036 (class 2606 OID 49524)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5029 (class 2606 OID 41384)
-- Name: attendance fk_student; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public.users("StudentId");


--
-- TOC entry 5034 (class 2606 OID 49473)
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5035 (class 2606 OID 49500)
-- Name: policy_acceptance_history policy_acceptance_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_acceptance_history
    ADD CONSTRAINT policy_acceptance_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5031 (class 2606 OID 49394)
-- Name: user_2fa user_2fa_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_2fa
    ADD CONSTRAINT user_2fa_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5030 (class 2606 OID 49366)
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5033 (class 2606 OID 49450)
-- Name: user_profile user_profile_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5032 (class 2606 OID 49421)
-- Name: user_security user_security_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_security
    ADD CONSTRAINT user_security_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-05-24 23:24:25

--
-- PostgreSQL database dump complete
--

\unrestrict Mjpf2ToaFthtdbW4CiYaxMCSYLvt27hORQw1KKcb8DwchZC3F0J48SD6n7WboLc

