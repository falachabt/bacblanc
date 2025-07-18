# ElearnAdminLogin Integration

This implementation adds integration with the external elearnprepa.com API for admin authentication and user info retrieval.

## Components Added

### 1. ElearnAdminLogin Component (`src/components/ElearnAdminLogin.jsx`)

A React component that presents a form for email and password authentication with elearnprepa.com.

**Features:**
- Email and password input fields with validation
- Loading states during authentication
- Error handling and display
- Clean, responsive design using Tailwind CSS
- Calls elearnprepa.com API endpoints for authentication

**Props:**
- `onAuth(authData)` - Callback function called when authentication is successful

**Authentication Flow:**
1. User enters email and password
2. Component POSTs to `https://elearnprepa.com/api/external/login` to obtain access token
3. Uses access token to POST to `https://elearnprepa.com/api/external/user-info` to retrieve user info
4. Calls `onAuth` callback with authentication data:
   ```javascript
   {
     token: "access_token_string",
     user: { /* user info object */ },
     isAuthenticated: true
   }
   ```

### 2. AdminPanel Page (`src/pages/AdminPanel.jsx`)

Example usage of the ElearnAdminLogin component that demonstrates the authentication flow.

**Features:**
- Shows login form when not authenticated
- Displays user information when authenticated
- Shows authentication status and token info
- Logout functionality
- Raw user data display for debugging

## Usage Example

```jsx
import ElearnAdminLogin from '@/components/ElearnAdminLogin';

function MyAdminPage() {
  const [authData, setAuthData] = useState(null);

  const handleAuth = (data) => {
    setAuthData(data);
    // Now you have access to:
    // - data.token (access token)
    // - data.user (user information)
    // - data.isAuthenticated (boolean)
  };

  if (!authData?.isAuthenticated) {
    return <ElearnAdminLogin onAuth={handleAuth} />;
  }

  return (
    <div>
      <h1>Welcome, {authData.user.firstname}!</h1>
      {/* Your admin interface here */}
    </div>
  );
}
```

## Key Features

- **No localStorage**: Authentication data is kept only in React state as requested
- **Error handling**: Displays user-friendly error messages for failed authentication
- **Loading states**: Shows appropriate loading indicators during API calls
- **Responsive design**: Works well on desktop and mobile devices
- **Type safety**: Proper error handling for malformed API responses

## API Endpoints Used

1. **Login**: `POST https://elearnprepa.com/api/external/login`
   - Body: `{ email, password }`
   - Returns: `{ access_token: string }`

2. **User Info**: `POST https://elearnprepa.com/api/external/user-info` 
   - Headers: `Authorization: Bearer {access_token}`
   - Returns: User information object

## Testing

The components have been tested and verified to:
- ✅ Render correctly
- ✅ Handle form validation (button disabled until both fields filled)
- ✅ Make API calls to correct endpoints
- ✅ Handle network errors gracefully
- ✅ Display error messages to users
- ✅ Pass authentication data to parent components

## Screenshots

![Login Form](https://github.com/user-attachments/assets/413bc6aa-040f-4bf0-88b2-1f1c8f525d5b)

![Error Handling](https://github.com/user-attachments/assets/f92252e4-2f71-414c-a2c9-5d18757ba953)