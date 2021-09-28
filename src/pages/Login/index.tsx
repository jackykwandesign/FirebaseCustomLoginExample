import { getAuth, signInWithPopup, GoogleAuthProvider, Auth, createUserWithEmailAndPassword, getIdToken, signInWithEmailAndPassword, FacebookAuthProvider, OAuthCredential, OAuthProvider, sendSignInLinkToEmail, signInWithEmailLink, isSignInWithEmailLink } from "firebase/auth";
import { useEffect, useState } from "react";
import firebaseAppWithConfig from "../../config/firebaseConfig";
import { useHistory } from "react-router-dom"

export enum FirebaseProvider {
    GOOGLE="GOOGLE",
    FACEBOOK="FACEBOOK",
    APPLE="APPLE",
    // CUSTOM="CUSTOM",
}

function Login() {
    const history = useHistory()
    const auth = getAuth(firebaseAppWithConfig)

    async function handleSignInSuccess(firebaseToken:string) {
        history.push('/')
    }
    
    // email and password
    async function handleCreateUserWithEmailAndPassword(_auth:Auth, _email:string, _password:string){
        try {
            const userCredential = await createUserWithEmailAndPassword(_auth, _email, _password)
            const firebaseToken = await getIdToken(userCredential.user, true)
            console.log("firebaseToken", firebaseToken)
            alert(`SignUp ${userCredential.user.email}`)
            await handleSignInSuccess(firebaseToken)
        } catch (error) {
            console.log("error", JSON.stringify(error))
            alert("SignUp failed")
        }
    }

    async function handleSignInWithEmailAndPassword(_auth:Auth, _email:string, _password:string){
        try {
            const userCredential = await signInWithEmailAndPassword(_auth, _email, _password)
            const firebaseToken = await getIdToken(userCredential.user, true)
            console.log("firebaseToken", firebaseToken)
            alert(`SignIn ${userCredential.user.email}`)
            await handleSignInSuccess(firebaseToken)
        } catch (error) {
            console.log("error", JSON.stringify(error))
            alert("SignIn failed")
        }
    }

    // magiclink
    async function handleSendSignInLinkToEmail(_auth:Auth, _email:string){
        try {
            const actionCodeSettings = {
                url: 'http://localhost:3001/login',
                // no need to setup if not building IOS or Andriod app
                // iOS: {
                //    bundleId: 'com.example.ios'
                // },
                // android: {
                //   packageName: 'com.example.android',
                //   installApp: true,
                //   minimumVersion: '12'
                // },
                handleCodeInApp: true
            }
            await sendSignInLinkToEmail(_auth, _email, actionCodeSettings)
            window.localStorage.setItem('emailForSignIn', email)
            alert(`SignIn Link Sent to ${_email}`)
        } catch (error) {
            console.log("error", JSON.stringify(error))
            alert("SignIn failed")
        }
    }

    async function handleSignInWithEmailLink(_auth:Auth, url:string) {
        try {
            if(isSignInWithEmailLink(_auth, url)){
                setIsLoading(true)
                let email = window.localStorage.getItem('emailForSignIn')
                if (!email) {
                    // User opened the link on a different device. To prevent session fixation
                    // attacks, ask the user to provide the associated email again. For example:
                    email = window.prompt('Please provide your email for confirmation');
                }
                if(email){
                    const userCredential = await signInWithEmailLink(_auth, email, url)
                    console.log("userCredential", userCredential)
                    window.localStorage.removeItem('emailForSignIn')
                    const firebaseToken = await getIdToken(userCredential.user, true)
                    console.log("firebaseToken", firebaseToken)
                    alert(`SignIn with MagicLink ${email}`)
                    await handleSignInSuccess(firebaseToken)
                }
                setIsLoading(false)
            }
        } catch (error) {
            console.log("error", JSON.stringify(error))
            alert("SignIn failed")
        }
    }

    // sso provider
    async function handleSignInwithPopup(_auth:Auth, firebaseProvider:FirebaseProvider) {
        // https://firebase.google.com/docs/auth/web/facebook-login
        try {
            let authProvider: GoogleAuthProvider | FacebookAuthProvider | OAuthProvider | null = null
            switch(firebaseProvider){
                case FirebaseProvider.GOOGLE:
                    authProvider = new GoogleAuthProvider()
                    // authProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
                    authProvider.setCustomParameters({prompt: 'select_account'})
                    break
                case FirebaseProvider.FACEBOOK:
                    authProvider = new FacebookAuthProvider()
                    break
                case FirebaseProvider.APPLE:
                    authProvider = new OAuthProvider('apple.com')
                    break
                default:
                    break
            }
            if(!authProvider)return alert("SignIn failed. No Provider.")
            const result = await signInWithPopup(_auth, authProvider)
            console.log(JSON.stringify(result))
            let credential: OAuthCredential | null = null
            // console.log("_provider", _provider)
            switch(firebaseProvider){
                case FirebaseProvider.GOOGLE:
                    credential = GoogleAuthProvider.credentialFromResult(result)
                    break
                case FirebaseProvider.FACEBOOK:
                    credential = FacebookAuthProvider.credentialFromResult(result)
                    break
                case FirebaseProvider.APPLE:
                    credential = OAuthProvider.credentialFromResult(result)
                    break
                default:
                    break
            }
            if(!credential)return alert("SignIn failed. No Credential.")
            const accessToken = credential.accessToken;
            const idToken = credential.idToken;
            console.log("accessToken", accessToken)
            console.log("idToken", idToken)
            if(idToken){
                await handleSignInSuccess(idToken)
            }
        } catch (error) {
            console.log("error", JSON.stringify(error))
            alert("SignIn failed")
        }
    }



    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    
    useEffect(() => {
        if(auth){
            handleSignInWithEmailLink(auth, window.location.href)
        }
        // eslint-disable-next-line
    }, [auth])
    if(isLoading){
        return(
            <div>Signing In / Up...</div>
        )
    }
    return (
        <div>
            <input value={email} onChange={e=> setEmail(e.currentTarget.value)}/>
            <input value={password} onChange={e=> setPassword(e.currentTarget.value)}/>
            <button onClick={() => handleCreateUserWithEmailAndPassword(auth, email, password)}>SignUp</button>
            <button onClick={() => handleSignInWithEmailAndPassword(auth, email, password)}>SignIn</button>
            <button onClick={() => handleSendSignInLinkToEmail(auth, email)}>MagicLink</button>
            <br />
            <button onClick={() => handleSignInwithPopup(auth, FirebaseProvider.GOOGLE)}>Google</button>
            <button onClick={() => handleSignInwithPopup(auth, FirebaseProvider.FACEBOOK)}>Facebook</button>
            <button onClick={() => handleSignInwithPopup(auth, FirebaseProvider.APPLE)}>Apple</button>
        </div>
    )
}

export default Login
