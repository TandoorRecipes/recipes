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
    type AllauthClientV1AuthPasswordResetGet200Response,
    AllauthClientV1AuthPasswordResetGet200ResponseFromJSON,
    AllauthClientV1AuthPasswordResetGet200ResponseToJSON,
} from '../models/AllauthClientV1AuthPasswordResetGet200Response';
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
    type ErrorResponse,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
} from '../models/ErrorResponse';
import {
    type RequestPassword,
    RequestPasswordFromJSON,
    RequestPasswordToJSON,
} from '../models/RequestPassword';
import {
    type ResetPassword,
    ResetPasswordFromJSON,
    ResetPasswordToJSON,
} from '../models/ResetPassword';

export interface AllauthClientV1AuthPasswordRequestPostRequest {
    client: AllauthClientV1AuthPasswordRequestPostClientEnum;
    requestPassword: RequestPassword;
}

export interface AllauthClientV1AuthPasswordResetGetRequest {
    client: AllauthClientV1AuthPasswordResetGetClientEnum;
    xPasswordResetKey: string;
}

export interface AllauthClientV1AuthPasswordResetPostRequest {
    client: AllauthClientV1AuthPasswordResetPostClientEnum;
    resetPassword?: ResetPassword;
}

/**
 * 
 */
export class AuthenticationPasswordResetApi extends runtime.BaseAPI {

    /**
     * Creates request options for allauthClientV1AuthPasswordRequestPost without sending the request
     */
    async allauthClientV1AuthPasswordRequestPostRequestOpts(requestParameters: AllauthClientV1AuthPasswordRequestPostRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthPasswordRequestPost().'
            );
        }

        if (requestParameters['requestPassword'] == null) {
            throw new runtime.RequiredError(
                'requestPassword',
                'Required parameter "requestPassword" was null or undefined when calling allauthClientV1AuthPasswordRequestPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';


        let urlPath = `/_allauth/{client}/v1/auth/password/request`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: RequestPasswordToJSON(requestParameters['requestPassword']),
        };
    }

    /**
     * Initiates the password reset procedure. Depending on whether or not `ACCOUNT_PASSWORD_RESET_BY_CODE_ENABLED` is `True`, the procedure is either stateless or stateful.  In case codes are used, it is stateful, and a new `password_reset_by_code` flow is started. In this case, on a successful password reset request, you will receive a 401 indicating the pending status of this flow.  In case password reset is configured to use (stateless) links, you will receive a 200 on a successful password reset request. 
     * Request password
     */
    async allauthClientV1AuthPasswordRequestPostRaw(requestParameters: AllauthClientV1AuthPasswordRequestPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AllauthClientV1AccountAuthenticatorsTotpDelete200Response>> {
        const requestOptions = await this.allauthClientV1AuthPasswordRequestPostRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AllauthClientV1AccountAuthenticatorsTotpDelete200ResponseFromJSON(jsonValue));
    }

    /**
     * Initiates the password reset procedure. Depending on whether or not `ACCOUNT_PASSWORD_RESET_BY_CODE_ENABLED` is `True`, the procedure is either stateless or stateful.  In case codes are used, it is stateful, and a new `password_reset_by_code` flow is started. In this case, on a successful password reset request, you will receive a 401 indicating the pending status of this flow.  In case password reset is configured to use (stateless) links, you will receive a 200 on a successful password reset request. 
     * Request password
     */
    async allauthClientV1AuthPasswordRequestPost(requestParameters: AllauthClientV1AuthPasswordRequestPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AllauthClientV1AccountAuthenticatorsTotpDelete200Response> {
        const response = await this.allauthClientV1AuthPasswordRequestPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Creates request options for allauthClientV1AuthPasswordResetGet without sending the request
     */
    async allauthClientV1AuthPasswordResetGetRequestOpts(requestParameters: AllauthClientV1AuthPasswordResetGetRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthPasswordResetGet().'
            );
        }

        if (requestParameters['xPasswordResetKey'] == null) {
            throw new runtime.RequiredError(
                'xPasswordResetKey',
                'Required parameter "xPasswordResetKey" was null or undefined when calling allauthClientV1AuthPasswordResetGet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['xPasswordResetKey'] != null) {
            headerParameters['X-Password-Reset-Key'] = String(requestParameters['xPasswordResetKey']);
        }


        let urlPath = `/_allauth/{client}/v1/auth/password/reset`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        };
    }

    /**
     * Used to obtain information on and validate a password reset key.  The key passed is either the key encoded in the password reset URL that the user has received per email, or, the password reset code in case of `ACCOUNT_PASSWORD_RESET_BY_CODE_ENABLED`. Note that in case of a code, the number of requests you can make is limited (by `ACCOUNT_PASSWORD_RESET_BY_CODE_MAX_ATTEMPTS`). 
     * Get password reset information
     */
    async allauthClientV1AuthPasswordResetGetRaw(requestParameters: AllauthClientV1AuthPasswordResetGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AllauthClientV1AuthPasswordResetGet200Response>> {
        const requestOptions = await this.allauthClientV1AuthPasswordResetGetRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AllauthClientV1AuthPasswordResetGet200ResponseFromJSON(jsonValue));
    }

    /**
     * Used to obtain information on and validate a password reset key.  The key passed is either the key encoded in the password reset URL that the user has received per email, or, the password reset code in case of `ACCOUNT_PASSWORD_RESET_BY_CODE_ENABLED`. Note that in case of a code, the number of requests you can make is limited (by `ACCOUNT_PASSWORD_RESET_BY_CODE_MAX_ATTEMPTS`). 
     * Get password reset information
     */
    async allauthClientV1AuthPasswordResetGet(requestParameters: AllauthClientV1AuthPasswordResetGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AllauthClientV1AuthPasswordResetGet200Response> {
        const response = await this.allauthClientV1AuthPasswordResetGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Creates request options for allauthClientV1AuthPasswordResetPost without sending the request
     */
    async allauthClientV1AuthPasswordResetPostRequestOpts(requestParameters: AllauthClientV1AuthPasswordResetPostRequest): Promise<runtime.RequestOpts> {
        if (requestParameters['client'] == null) {
            throw new runtime.RequiredError(
                'client',
                'Required parameter "client" was null or undefined when calling allauthClientV1AuthPasswordResetPost().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';


        let urlPath = `/_allauth/{client}/v1/auth/password/reset`;
        urlPath = urlPath.replace('{client}', encodeURIComponent(String(requestParameters['client'])));

        return {
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ResetPasswordToJSON(requestParameters['resetPassword']),
        };
    }

    /**
     * Perform the password reset, by handing over the password reset key and the new password. After successfully completing the password reset, the user is either logged in (in case `ACCOUNT_LOGIN_ON_PASSWORD_RESET` is `True`), or, the user will need to proceed to the login page.  In case of the former, a `200` status code is returned, in case of the latter a 401. 
     * Reset password
     */
    async allauthClientV1AuthPasswordResetPostRaw(requestParameters: AllauthClientV1AuthPasswordResetPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AuthenticatedResponse>> {
        const requestOptions = await this.allauthClientV1AuthPasswordResetPostRequestOpts(requestParameters);
        const response = await this.request(requestOptions, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AuthenticatedResponseFromJSON(jsonValue));
    }

    /**
     * Perform the password reset, by handing over the password reset key and the new password. After successfully completing the password reset, the user is either logged in (in case `ACCOUNT_LOGIN_ON_PASSWORD_RESET` is `True`), or, the user will need to proceed to the login page.  In case of the former, a `200` status code is returned, in case of the latter a 401. 
     * Reset password
     */
    async allauthClientV1AuthPasswordResetPost(requestParameters: AllauthClientV1AuthPasswordResetPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AuthenticatedResponse> {
        const response = await this.allauthClientV1AuthPasswordResetPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const AllauthClientV1AuthPasswordRequestPostClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthPasswordRequestPostClientEnum = typeof AllauthClientV1AuthPasswordRequestPostClientEnum[keyof typeof AllauthClientV1AuthPasswordRequestPostClientEnum];
/**
 * @export
 */
export const AllauthClientV1AuthPasswordResetGetClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthPasswordResetGetClientEnum = typeof AllauthClientV1AuthPasswordResetGetClientEnum[keyof typeof AllauthClientV1AuthPasswordResetGetClientEnum];
/**
 * @export
 */
export const AllauthClientV1AuthPasswordResetPostClientEnum = {
    App: 'app',
    Browser: 'browser'
} as const;
export type AllauthClientV1AuthPasswordResetPostClientEnum = typeof AllauthClientV1AuthPasswordResetPostClientEnum[keyof typeof AllauthClientV1AuthPasswordResetPostClientEnum];
