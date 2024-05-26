import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

import { login, getChallenge, loginByPublicKey, register } from 'src/services/index';
// import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

function base64_urlsafe_encode(buffer) {
  const base64 = window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64_urlsafe_decode(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binStr = window.atob(base64);
  const bin = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    bin[i] = binStr.charCodeAt(i);
  }
  return bin.buffer;
}


export default function LoginView() {
  const theme = useTheme();

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [helper, setHelper] = useState('');

  const [biz, setBiz] = useState('login');


  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setHelper('')
  };

  const handleClick = () => {
    const pwd = document.getElementsByName('password')[0].value;
    const email = document.getElementsByName('email')[0].value;
    if (biz === 'login') {
      loginHandle({ pwd, email });
    } else {
      registerHandle({ pwd, email });
    }
  };

  const loginHandle = async ({ pwd, email }) => {
    try {
      const { data, msg } = await login({
        password: pwd,
        email,
      })
      if (data) {
        localStorage.setItem('userinfo', JSON.stringify(data));
        router.push(`/`);
      } else {
        setHelper(msg);
      }
    } catch (error) {
      setHelper(error.msg);
    }
  }

  const registerHandle = async ({ pwd, email }) => {
    try {
      const { data, msg } = await register({
        password: pwd,
        email,
      })
      if (data) {
        localStorage.setItem('userinfo', JSON.stringify(data));
        router.push('/');
      } else {
        setHelper(msg);
      }
    } catch (error) {
      setHelper(error.msg);
    }
  }

  const passKeyHandle = async () => {
    if (
      typeof window.PublicKeyCredential !== 'undefined'
      && typeof window.PublicKeyCredential.isConditionalMediationAvailable === 'function'
    ) {
      const available = await window.PublicKeyCredential.isConditionalMediationAvailable();
      if (available) {
        try {
          const { data } = await getChallenge();

          const publicKeyCredentialRequestOptions = {
            challenge: base64_urlsafe_decode(data.challenge),
            // allowCredentials: [{
            //   id: Uint8Array.from(
            //     'credentialId', c => c.charCodeAt(0)),
            //   type: 'public-key',
            //   transports: ['usb', 'ble', 'nfc'],
            // }],
            timeout: 60000,
          }
          console.log('credentials before')
          const credentials = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions })
          console.log('credentials', credentials)
          const { msg, data: userInfo } = await loginByPublicKey(credentials);
          if (msg) {
            setHelper(msg)
          } else {
            localStorage.setItem('userinfo', JSON.stringify(userInfo));
            router.push('/');
          }
        } catch (err) {
          console.error('Error with conditional UI:', err);
        }
      }
    }
  }

  const loginByPassKey = async () => {

  }

  const getChallengeHandle = async () => {

  }

  const bizTypeSignUpHandle = () => {
    setBiz('signup')
  }

  const bizTypeLoginHandle = () => {
    setBiz('login')
  }

  const renderForm = (
    <>
      <Stack spacing={3}>
        <TextField name="email" label="Email address" />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}>
        {/* <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link> */}
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={handleClick}
      >
        {biz === 'login' ? 'Login' : 'Sign Up'}
      </LoadingButton>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Snackbar anchorOrigin={{ vertical: "top", horizontal: 'center' }} open={!!helper} autoHideDuration={1500} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {helper}
        </Alert>
      </Snackbar>
      {/* <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      /> */}

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Sign in to Minimal</Typography>

          {
            biz === 'login' ? <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
              还没有账号？
              <Link onClick={bizTypeSignUpHandle} variant="subtitle2" sx={{ ml: 0.5 }}>
                注册
              </Link>
            </Typography> : <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
              已有账号？
              <Link onClick={bizTypeLoginHandle} variant="subtitle2" sx={{ ml: 0.5 }}>
                去登陆
              </Link>
            </Typography>
          }

          {biz === 'login' ? <><Stack direction="row" spacing={2}>
            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              onClick={passKeyHandle}
              sx={{ borderColor: alpha(theme.palette.grey[500], 0.16) }}
            >
              使用 PASSKEY 登陆
            </Button>
          </Stack>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                OR
              </Typography>
            </Divider></> : ''}

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
