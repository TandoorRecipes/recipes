/* tslint:disable */
/* eslint-disable */
/**
 * django-allauth: Headless API
 * # Introduction  Welcome to the django-allauth API specification. This API is intended to be consumed by two different kind of clients:  - Web applications running in a **browser** context. For example, a   single-page React application, to which the end user can navigate using a web   browser.  - Applications, **apps** for short, executing in non-browser contexts. For example,   a mobile Android or iOS application.  The security considerations for these two usage types are different. In a browser context, cookies play a role.  Without taking special precautions, your web application may be vulnerable to Cross-Site Request Forgery attacks.  For mobile applications, this does not apply.  The API can be used for both use cases. Differences in handling of security is automatically adjusted for, based on the request path used to make the API call. For example, signing up can either be done using the `/_allauth/browser/v1/auth/signup` or the `/_allauth/app/v1/auth/signup` endpoint. For the **browser** usage, session cookies and CSRF protection applies. For the **app** usage, cookies play no role, instead, a session token is used.  The paths of all endpoints are documented in the form of `/_allauth/{client}/v1/auth/signup`. Depending on the client type (`{client}`), there may be slight differences in request/response handling.  This is documented where applicable.   # Scope  The following functionality is all in scope and handled as part of this API:  - Regular accounts:   - Login   - Signup   - Password forgotten   - Manage email (add, remove, verify, select a different primary)   - Change password.   - Verification of email addresses. - Two-Factor Authentication:   - Authentication using an authenticator code   - (De)activate TOTP   - (Re)generate recovery codes   - \"Trust this browser\" - Third-party providers:   - Authenticate by performing a browser-level redirect (synchronous request).   - Authenticate by means of a provider token.   - Connect additional provider accounts.   - Disconnect existing provider accounts.   - Setting a password in case no password was set, yet.   - Querying additional information before signing up. - Session management:   - Listing all sessions for a user.   - Signing out of any of those sessions.   # Browser Usage  For web applications running in a browser, routing needs to be setup correctly such that the sessions initiated at the backend are accessible in the frontend.  ## Routing  When using the API in a browser context, regular Django sessions are used, along with the usual session cookies. There are several options for setting up the routing of your application.   ###  Single Domain Routing  With single domain, path-based routing, both your frontend and backend are served from the same domain, for example `https://app.org`. You will have to make sure that some paths are served by the frontend, and others by the backend.   ### Sub-domain Routing  With sub-domain based routing, the frontend and backend are served from different domains.  However, as session cookies are used, these different domains must share common main domain.  For example, you may use `app.project.org` for the frontend, which interfaces with the backend over at `backend.project.org`.  In this setup, Django will need to be configured with:  ``` SESSION_COOKIE_DOMAIN = \"project.org\" CSRF_COOKIE_DOMAIN = \"project.org\" ```  If your organization hosts unrelated applications, for example, a CMS for marketing purposes, on the top level domain (`project.org`), it is not advisable to set the session cookie domain to `project.org`, as those other applications could get access to the session cookie. In that case, it is advised to use `backend.app.project.org` for the backend, and set the session cookie domain to `app.project.org`.   # App Usage  For app based usage, cookies play no role, yet, sessions are still used. When a user walks through the authentication flow, a session is created.  Having an authenticated session is proof that the user is allowed to further interact with the backend. Unauthenticated sessions are also needed to remember state while the user proceeds to go over the required steps necessary to authenticate.   ## Session Tokens  Given that there is no cookie to point to the session, the header `X-Session-Token` is used instead. The way of working is as follows:  - If you do not have a session token yet, do not send the `X-Session-Token` header.  - When making requests, session tokens can appear in the metadata   (`meta.session_token`) of authentication related responses. If a session   token appears, store it (overwriting any previous session token), and ensure   to add the token to the `X-Session-Token` header of all subsequent requests.  - When receiving an authentication related response with status code 410   (`Gone`), that is meant to indicate that the session is no longer valid.   Remove the session token and start clean.   ## Access Tokens  While session tokens are required to handle the authentication process, depending on your requirements, a different type of token may be needed once authenticated.  For example, your app likely needs access to other APIs as well. These APIs may  even be implemented using different technologies, in which case having a  stateless token, possibly a JWT encoding the user ID, might be a good fit.  In this API and its implementation no assumptions, and no (limiting) design decisions are made in this regard. The token strategy of django-allauth is pluggable, such that you can expose your own access token when the user authenticates. As for as the API specification is concerned, the access token will appear in the response of metadata (`meta.access_token`) of a successful authentication request. How you can customize the token strategy can be found over at the documentation of the `allauth.headless` Django application.   # Responses  Unless documented otherwise, responses are objects with the following properties: - The `status`, matching the HTTP status code. - Data, if any, is returned as part of the `data` key. - Metadata, if any, is returned as part of the `meta` key. - Errors, if any, are listed in the `errors` key.   # Authentication Flows  In order to become authenticated, the user must complete a flow, potentially consisting of several steps. For example: - A login, after which the user is authenticated. - A Login, followed by two-factor authentication, after which the user is   authenticated. - A signup, followed by mandatory email verification, after which the user is   authenticated.  The API signals to the client that (re)authentication is required by means of a `401` or `410` status code: - Not authenticated: status `401`. - Re-authentication required: status `401`, with `meta.is_authenticated = true`. - Invalid session: status `410`. This only occurs for clients of type `app`.  All authentication related responses have status `401` or `410`, and, `meta.is_authenticated` indicating whether authentication, or re-authentication is required.  The flows the client can perform to initiate or complete the authentication are communicates as part of authentication related responses. The authentication can be initiated by means of these flows: - Login using a local account (`login`). - Signup for a local account (`signup`). - Login or signup using the third-party provider redirect flow (`provider_redirect`). - Login or signup by handing over a third-party provider retrieved elsewhere (`provider_token`). - Login using a special code (`login_by_code`). - Login using a passkey (`mfa_login_webauthn`). - Signup using a passkey (`mfa_signup_webauthn`).  Depending on the state of the account, and the configuration of django-allauth, the flows above can either lead to becoming directly authenticated, or, to followup flows: - Provider signup (`provider_signup`). - Email verification (`verify_email`). - Phone verification (`phone_email`). - Two-factor authentication required (TOTP, recovery codes, or WebAuthn) (`mfa_authenticate`). - Trust this browser (`mfa_trust`).  While authenticated, re-authentication may be required to safeguard the account when sensitive actions are performed. The re-authentication flows are the following: - Re-authenticate using password (`reauthenticate`). - Re-authenticate using a 2FA authenticator (TOTP, recovery codes, or WebAuthn) (`mfa_reauthenticate`).   # Security Considerations  ## Input Sanitization  The Django framework, by design, does *not* perform input sanitization. For example, there is nothing preventing end users from signing up using `<script>` or `Robert\'); DROP TABLE students` as a first name. Django relies on its template language for proper escaping of such values and mitigate any XSS attacks.  As a result, any `allauth.headless` client **must** have proper XSS protection in place as well. Be prepared that, for example, the WebAuthn endpoints could return authenticator names as follows:      {       \"name\": \"<script>alert(1)</script>\",       \"credential\": {         \"type\": \"public-key\",         ...       }     }
 *
 * The version of the OpenAPI document: 1
 * Contact: info@allauth.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import * as runtime from '../runtime';
import {
    type AllauthClientV1AccountAuthenticatorsTotpDelete200Response,
    AllauthClientV1AccountAuthenticatorsTotpDelete200ResponseFromJSON,
    AllauthClientV1AccountAuthenticatorsTotpDelete200ResponseToJSON,
} from '../models/AllauthClientV1AccountAuthenticatorsTotpDelete200Response';
import {
    type AllauthClientV1AuthCodeResendPost429Response,
    AllauthClientV1AuthCodeResendPost429ResponseFromJSON,
    AllauthClientV1AuthCodeResendPost429ResponseToJSON,
} from '../models/AllauthClientV1AuthCodeResendPost429Response';
import {
    type AuthenticatedResponse,
    AuthenticatedResponseFromJSON,
    AuthenticatedResponseToJSON,
} from '../models/AuthenticatedResponse';
import {
    type AuthenticationResponse,
    AuthenticationResponseFromJSON,
    AuthenticationResponseToJSON,
} from '../models/AuthenticationResponse';
import {
    type ConflictResponse,
    ConflictResponseFromJSON,
    ConflictResponseToJSON,
} from '../models/ConflictResponse';
import {
    type EmailVerificationInfo,
    EmailVerificationInfoFromJSON,
    EmailVerificationInfoToJSON,
} from '../models/EmailVerificationInfo';
import {
    type ErrorResponse,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
} from '../models/ErrorResponse';
import {
    type ForbiddenResponse,
    ForbiddenResponseFromJSON,
    ForbiddenResponseToJSON,
} from '../models/ForbiddenResponse';
import {
    type Login,
    LoginFromJSON,
    LoginToJSON,
} from '../models/Login';
import {
    type Reauthenticate,
    ReauthenticateFromJSON,
    ReauthenticateToJSON,
} from '../models/Reauthenticate';
import {
    type Signup,
    SignupFromJSON,
    SignupToJSON,
} from '../models/Signup';
import {
    type VerifyEmail,
    VerifyEmailFromJSON,
    VerifyEmailToJSON,
} from '../models/VerifyEmail';
import {
    type VerifyPhone,
    VerifyPhoneFromJSON,
    VerifyPhoneToJSON,
} from '../models/VerifyPhone';

export interface AllauthClientV1AuthEmailVerifyGetRequest {
    xEmailVerificationKey: string;
    client: AllauthClientV1AuthEmailVerifyGetClientEnum;
}

export interface AllauthClientV1AuthEmailVerifyPostRequest {
    client: AllauthClientV1AuthEmailVerifyPostClientEnum;
    xSessionToken?: string;
    verifyEmail?: VerifyEmail;
}

export interface AllauthClientV1AuthEmailVerifyResendPostRequest {
    client: AllauthClientV1AuthEmailVerifyResendPostClientEnum;
    xSessionToken?: string;
}

export interface AllauthClientV1AuthLoginPostRequest {
    client: AllauthClientV1AuthLoginPostClientEnum;
    login: Login;
}

export interface AllauthClientV1AuthPhoneVerifyPostRequest {
    client: AllauthClientV1AuthPhoneVerifyPostClientEnum;
    xSessionToken?: string;
    verifyPhone?: VerifyPhone;
}

export interface AllauthClientV1AuthPhoneVerifyResendPostRequest {
    client: AllauthClientV1AuthPhoneVerifyResendPostClientEnum;
    xSessionToken?: string;
}

export interface AllauthClientV1AuthReauthenticatePostRequest {
    client: AllauthClientV1AuthReauthenticatePostClientEnum;
    reauthenticate: Reauthenticate;
    xSessionToken?: string;
}

export interface AllauthClientV1AuthSignupPostRequest {
    client: AllauthClientV1AuthSignupPostClientEnum;
    signup: Signup;
}

/**
 * 
 */
export class AuthenticationAccountApi extends runtime.BaseAPI {

    /**
     * Creates request options for allauthClientV1AuthEmailVerifyGet without sending the request
     */
    async allauthClientV1AuthEmailVerifyGetRequestOpts(requestParameters: AllauthClientV1AuthEmailVerifyGetRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['xEmailVerificationKey'] == null) {
            throw new runtime.RequiredError(
                'xEmailVerificationKey',
                'Required parameter "xEmailVerificationKey" was null or undefined when calling allauthClientV1AuthEmailVerifyGet().'
            );
        }

        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthEmailVerifyGet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['xEmailVerificationKey'] != null) {
            headerParameters['X-Email-Verification-Key'] = String(requestParameters['xEmailVerificationKey']);
        }


        let urlPath = `/_allauth/{client}/v1/auth/email/verify`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        };
    }

    /**
     * Obtain email verification information, given the token that was sent to the user by email. 
     * Get email verification information
     */
    async allauthClientV1AuthEmailVerifyGetRaw(requestParameters: AllauthClientV1AuthEmailVerifyGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<EmailVerificationInfo>> {
        const requestOptions = await this.allauthClientV1AuthEmailVerifyGetRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => EmailVerificationInfoFromJSON(jsonValue));
    }

    /**
     * Obtain email verification information, given the token that was sent to the user by email. 
     * Get email verification information
     */
    async allauthClientV1AuthEmailVerifyGet(requestParameters: AllauthClientV1AuthEmailVerifyGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<EmailVerificationInfo> {
        const response = await this.allauthClientV1AuthEmailVerifyGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Creates request options for allauthClientV1AuthEmailVerifyPost without sending the request
     */
    async allauthClientV1AuthEmailVerifyPostRequestOpts(requestParameters: AllauthClientV1AuthEmailVerifyPostRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthEmailVerifyPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['xSessionToken'] != null) {
            headerParameters['X-Session-Token'] = String(requestParameters['xSessionToken']);
        }


        let urlPath = `/_allauth/{client}/v1/auth/email/verify`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: VerifyEmailToJSON(requestParameters['verifyEmail']),
        };
    }

    /**
     * Complete the email verification process. Depending on the configuration, email addresses are either verified by opening a link that is sent to their email address, or, by inputting a code that is sent. On the API, both cases are handled identically. Meaning, the required key is either the one from the link, or, the code itself.  Note that a status code of 401 does not imply failure. It indicates that the email verification was successful, yet, the user is still not signed in. For example, in case `ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION` is set to `False`, a 401 is returned when verifying as part of login/signup. 
     * Verify an email
     */
    async allauthClientV1AuthEmailVerifyPostRaw(requestParameters: AllauthClientV1AuthEmailVerifyPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AuthenticatedResponse>> {
        const requestOptions = await this.allauthClientV1AuthEmailVerifyPostRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AuthenticatedResponseFromJSON(jsonValue));
    }

    /**
     * Complete the email verification process. Depending on the configuration, email addresses are either verified by opening a link that is sent to their email address, or, by inputting a code that is sent. On the API, both cases are handled identically. Meaning, the required key is either the one from the link, or, the code itself.  Note that a status code of 401 does not imply failure. It indicates that the email verification was successful, yet, the user is still not signed in. For example, in case `ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION` is set to `False`, a 401 is returned when verifying as part of login/signup. 
     * Verify an email
     */
    async allauthClientV1AuthEmailVerifyPost(requestParameters: AllauthClientV1AuthEmailVerifyPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AuthenticatedResponse> {
        const response = await this.allauthClientV1AuthEmailVerifyPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Creates request options for allauthClientV1AuthEmailVerifyResendPost without sending the request
     */
    async allauthClientV1AuthEmailVerifyResendPostRequestOpts(requestParameters: AllauthClientV1AuthEmailVerifyResendPostRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthEmailVerifyResendPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['xSessionToken'] != null) {
            headerParameters['X-Session-Token'] = String(requestParameters['xSessionToken']);
        }


        let urlPath = `/_allauth/{client}/v1/auth/email/verify/resend`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        };
    }

    /**
     * Requests a new email verification code. Requires `ACCOUNT_EMAIL_VERIFICATION_SUPPORTS_RESEND = True`. 
     * Resend email verification code
     */
    async allauthClientV1AuthEmailVerifyResendPostRaw(requestParameters: AllauthClientV1AuthEmailVerifyResendPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AllauthClientV1AccountAuthenticatorsTotpDelete200Response>> {
        const requestOptions = await this.allauthClientV1AuthEmailVerifyResendPostRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AllauthClientV1AccountAuthenticatorsTotpDelete200ResponseFromJSON(jsonValue));
    }

    /**
     * Requests a new email verification code. Requires `ACCOUNT_EMAIL_VERIFICATION_SUPPORTS_RESEND = True`. 
     * Resend email verification code
     */
    async allauthClientV1AuthEmailVerifyResendPost(requestParameters: AllauthClientV1AuthEmailVerifyResendPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AllauthClientV1AccountAuthenticatorsTotpDelete200Response> {
        const response = await this.allauthClientV1AuthEmailVerifyResendPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Creates request options for allauthClientV1AuthLoginPost without sending the request
     */
    async allauthClientV1AuthLoginPostRequestOpts(requestParameters: AllauthClientV1AuthLoginPostRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthLoginPost().'
            );
        }

        if (requestParameters['login'] == null) {
            throw new runtime.RequiredError(
                'login',
                'Required parameter "login" was null or undefined when calling allauthClientV1AuthLoginPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';


        let urlPath = `/_allauth/{client}/v1/auth/login`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: LoginToJSON(requestParameters['login']),
        };
    }

    /**
     * Login using a username-password or email-password combination. 
     * Login
     */
    async allauthClientV1AuthLoginPostRaw(requestParameters: AllauthClientV1AuthLoginPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AuthenticatedResponse>> {
        const requestOptions = await this.allauthClientV1AuthLoginPostRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AuthenticatedResponseFromJSON(jsonValue));
    }

    /**
     * Login using a username-password or email-password combination. 
     * Login
     */
    async allauthClientV1AuthLoginPost(requestParameters: AllauthClientV1AuthLoginPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AuthenticatedResponse> {
        const response = await this.allauthClientV1AuthLoginPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Creates request options for allauthClientV1AuthPhoneVerifyPost without sending the request
     */
    async allauthClientV1AuthPhoneVerifyPostRequestOpts(requestParameters: AllauthClientV1AuthPhoneVerifyPostRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthPhoneVerifyPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['xSessionToken'] != null) {
            headerParameters['X-Session-Token'] = String(requestParameters['xSessionToken']);
        }


        let urlPath = `/_allauth/{client}/v1/auth/phone/verify`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: VerifyPhoneToJSON(requestParameters['verifyPhone']),
        };
    }

    /**
     * Complete the phone number verification process. Note that a status code of 401 does not imply failure. It merely indicates that the phone number verification was successful, yet, the user is still not signed in. 
     * Verify a phone number
     */
    async allauthClientV1AuthPhoneVerifyPostRaw(requestParameters: AllauthClientV1AuthPhoneVerifyPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AuthenticatedResponse>> {
        const requestOptions = await this.allauthClientV1AuthPhoneVerifyPostRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AuthenticatedResponseFromJSON(jsonValue));
    }

    /**
     * Complete the phone number verification process. Note that a status code of 401 does not imply failure. It merely indicates that the phone number verification was successful, yet, the user is still not signed in. 
     * Verify a phone number
     */
    async allauthClientV1AuthPhoneVerifyPost(requestParameters: AllauthClientV1AuthPhoneVerifyPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AuthenticatedResponse> {
        const response = await this.allauthClientV1AuthPhoneVerifyPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Creates request options for allauthClientV1AuthPhoneVerifyResendPost without sending the request
     */
    async allauthClientV1AuthPhoneVerifyResendPostRequestOpts(requestParameters: AllauthClientV1AuthPhoneVerifyResendPostRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthPhoneVerifyResendPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['xSessionToken'] != null) {
            headerParameters['X-Session-Token'] = String(requestParameters['xSessionToken']);
        }


        let urlPath = `/_allauth/{client}/v1/auth/phone/verify/resend`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        };
    }

    /**
     * Requests a new phone number verification code. Requires `ACCOUNT_PHONE_VERIFICATION_SUPPORTS_RESEND = True`. 
     * Resend phone number verification code
     */
    async allauthClientV1AuthPhoneVerifyResendPostRaw(requestParameters: AllauthClientV1AuthPhoneVerifyResendPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AllauthClientV1AccountAuthenticatorsTotpDelete200Response>> {
        const requestOptions = await this.allauthClientV1AuthPhoneVerifyResendPostRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AllauthClientV1AccountAuthenticatorsTotpDelete200ResponseFromJSON(jsonValue));
    }

    /**
     * Requests a new phone number verification code. Requires `ACCOUNT_PHONE_VERIFICATION_SUPPORTS_RESEND = True`. 
     * Resend phone number verification code
     */
    async allauthClientV1AuthPhoneVerifyResendPost(requestParameters: AllauthClientV1AuthPhoneVerifyResendPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AllauthClientV1AccountAuthenticatorsTotpDelete200Response> {
        const response = await this.allauthClientV1AuthPhoneVerifyResendPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Creates request options for allauthClientV1AuthReauthenticatePost without sending the request
     */
    async allauthClientV1AuthReauthenticatePostRequestOpts(requestParameters: AllauthClientV1AuthReauthenticatePostRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthReauthenticatePost().'
            );
        }

        if (requestParameters['reauthenticate'] == null) {
            throw new runtime.RequiredError(
                'reauthenticate',
                'Required parameter "reauthenticate" was null or undefined when calling allauthClientV1AuthReauthenticatePost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['xSessionToken'] != null) {
            headerParameters['X-Session-Token'] = String(requestParameters['xSessionToken']);
        }


        let urlPath = `/_allauth/{client}/v1/auth/reauthenticate`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ReauthenticateToJSON(requestParameters['reauthenticate']),
        };
    }

    /**
     * In order to safeguard the account, some actions require the user to be recently authenticated.  If you try to perform such an action without having been recently authenticated, a `401` status is returned, listing flows that can be performed to reauthenticate. One such flow is the flow with ID `reauthenticate`, which allows for the user to input the password. This is the endpoint related towards that flow. 
     * Reauthenticate
     */
    async allauthClientV1AuthReauthenticatePostRaw(requestParameters: AllauthClientV1AuthReauthenticatePostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AuthenticatedResponse>> {
        const requestOptions = await this.allauthClientV1AuthReauthenticatePostRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AuthenticatedResponseFromJSON(jsonValue));
    }

    /**
     * In order to safeguard the account, some actions require the user to be recently authenticated.  If you try to perform such an action without having been recently authenticated, a `401` status is returned, listing flows that can be performed to reauthenticate. One such flow is the flow with ID `reauthenticate`, which allows for the user to input the password. This is the endpoint related towards that flow. 
     * Reauthenticate
     */
    async allauthClientV1AuthReauthenticatePost(requestParameters: AllauthClientV1AuthReauthenticatePostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AuthenticatedResponse> {
        const response = await this.allauthClientV1AuthReauthenticatePostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Creates request options for allauthClientV1AuthSignupPost without sending the request
     */
    async allauthClientV1AuthSignupPostRequestOpts(requestParameters: AllauthClientV1AuthSignupPostRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthSignupPost().'
            );
        }

        if (requestParameters['signup'] == null) {
            throw new runtime.RequiredError(
                'signup',
                'Required parameter "signup" was null or undefined when calling allauthClientV1AuthSignupPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';


        let urlPath = `/_allauth/{client}/v1/auth/signup`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: SignupToJSON(requestParameters['signup']),
        };
    }

    /**
     * Whether or not `username`, `email`, `phone` or combination of those are required depends on the configuration of django-allauth. Additionally, if a custom signup form is used there may be other custom properties required. 
     * Signup
     */
    async allauthClientV1AuthSignupPostRaw(requestParameters: AllauthClientV1AuthSignupPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AuthenticatedResponse>> {
        const requestOptions = await this.allauthClientV1AuthSignupPostRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AuthenticatedResponseFromJSON(jsonValue));
    }

    /**
     * Whether or not `username`, `email`, `phone` or combination of those are required depends on the configuration of django-allauth. Additionally, if a custom signup form is used there may be other custom properties required. 
     * Signup
     */
    async allauthClientV1AuthSignupPost(requestParameters: AllauthClientV1AuthSignupPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AuthenticatedResponse> {
        const response = await this.allauthClientV1AuthSignupPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const AllauthClientV1AuthEmailVerifyGetClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthEmailVerifyGetClientEnum = typeof AllauthClientV1AuthEmailVerifyGetClientEnum[keyof typeof AllauthClientV1AuthEmailVerifyGetClientEnum];
/**
 * @export
 */
export const AllauthClientV1AuthEmailVerifyPostClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthEmailVerifyPostClientEnum = typeof AllauthClientV1AuthEmailVerifyPostClientEnum[keyof typeof AllauthClientV1AuthEmailVerifyPostClientEnum];
/**
 * @export
 */
export const AllauthClientV1AuthEmailVerifyResendPostClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthEmailVerifyResendPostClientEnum = typeof AllauthClientV1AuthEmailVerifyResendPostClientEnum[keyof typeof AllauthClientV1AuthEmailVerifyResendPostClientEnum];
/**
 * @export
 */
export const AllauthClientV1AuthLoginPostClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthLoginPostClientEnum = typeof AllauthClientV1AuthLoginPostClientEnum[keyof typeof AllauthClientV1AuthLoginPostClientEnum];
/**
 * @export
 */
export const AllauthClientV1AuthPhoneVerifyPostClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthPhoneVerifyPostClientEnum = typeof AllauthClientV1AuthPhoneVerifyPostClientEnum[keyof typeof AllauthClientV1AuthPhoneVerifyPostClientEnum];
/**
 * @export
 */
export const AllauthClientV1AuthPhoneVerifyResendPostClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthPhoneVerifyResendPostClientEnum = typeof AllauthClientV1AuthPhoneVerifyResendPostClientEnum[keyof typeof AllauthClientV1AuthPhoneVerifyResendPostClientEnum];
/**
 * @export
 */
export const AllauthClientV1AuthReauthenticatePostClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthReauthenticatePostClientEnum = typeof AllauthClientV1AuthReauthenticatePostClientEnum[keyof typeof AllauthClientV1AuthReauthenticatePostClientEnum];
/**
 * @export
 */
export const AllauthClientV1AuthSignupPostClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthSignupPostClientEnum = typeof AllauthClientV1AuthSignupPostClientEnum[keyof typeof AllauthClientV1AuthSignupPostClientEnum];
