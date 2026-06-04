import "../../globals.css";

export default function PasswordChange() {
    return (
        <main className="container-password">
            <form className="password-change">
                <form action="/password-change">
                    <div>
                        <label id="email">
                        <h2>Wpisz ostatnie hasło:</h2>
                    </label>
                    <input className="input-form" 
                        type="last-password" 
                        name="last-password" 
                        value={last-password}
                        onChange={(event) => setEmail(event.target.value)}
                        required/>

                    </div>
                    <div>
                        <label id="email">
                        <h2>Wpisz nowe hasło:</h2>
                    </label>
                    <input className="input-form" 
                        type="new-password" 
                        name="new-password" 
                        value={new-password}
                        onChange={(event) => setEmail(event.target.value)}
                        required/>

                    </div>
                    <div>
                        <label id="email">
                        <h2>Potwierdź nowe hasło:</h2>
                    </label>
                    <input className="input-form" 
                        type="new-password" 
                        name="new-password" 
                        value={new-password}
                        onChange={(event) => setEmail(event.target.value)}
                        required/>

                    </div>
                    <div className="container-login-bnt" style={{marginTop:"60px"}}>
                        <Link href="/main">   
                            <button className="login-bnt" type="submit" style={{fontSize:"20px", backgroundColor:"var(--light-purple)"}}>
                                <h3>Zapisz</h3>
                            </button>
                        </Link> 
                    </div>
                </form>
            </form>
        </main>
    )
}