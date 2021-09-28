import { Auth, getAuth, signOut, User } from '@firebase/auth'
import firebaseAppWithConfig from '../../config/firebaseConfig'
import { useHistory } from "react-router-dom"
import { useEffect, useState } from 'react'
function Home() {
    const auth = getAuth(firebaseAppWithConfig)
    const history = useHistory()
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    async function handleSignOut(_auth:Auth) {
        try {
            await signOut(_auth)
            setCurrentUser(null)
            console.log("Signout", _auth)
        } catch (error) {
            console.error("error", JSON.stringify(error))
            alert("SignOut failed")
        }
    }
    useEffect(() => {
        if(auth.currentUser){
            setCurrentUser(auth.currentUser)
        }
    }, [auth.currentUser])
    if(!currentUser){
        return (
            <div>
                <h1>You shall not pass</h1>
                <button onClick={()=>{
                    history.push('/login')
                }}>Go to Login</button>
            </div>
        )
    }
    return (
        <div>
            Welcome {currentUser.email}
            <br />
            <button onClick={() => handleSignOut(auth)}>SignOut</button>
        </div>
    )
}

export default Home
