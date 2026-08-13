export default function HowToUse() {

    return (
        <div className="relative bg-white/2 border-white/10 w-full h-full squircle squircle-md backdrop-blur-2xl border overflow-hidden">

            <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll">

                <div className="z-50 relative mx-auto flex min-h-full max-w-200 flex-col px-5 py-5 md:p-10">
                    
                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        How it works?
                    </h2>

                    <div className="flex flex-col w-full text">

                        <p>
                            Unlike other password managers, this website does not store your passwords anywhere. Instead, it stores the "ingredients" to create them and combines them with your master password each time you need them.
                        </p>

                        <h3>How it works step by step</h3>
                        <ol>
                            <li><b>You create a "master password"</b> (the only one you need to remember).</li>
                            <li><b>For each service</b> (e.g. Gmail, Twitter, etc.), the website stores:
                                <ul>
                                    <li>An <b>identifier</b> (e.g. the service name).</li>
                                    <li>The <b>length</b> you want the password to have.</li>
                                    <li>The <b>alphabet</b> to use (numbers only, letters and numbers, etc.).</li>
                                </ul>
                            </li>
                            <li><b>When you need the password</b>, the website combines that data with your master password <b>right at that moment</b> to generate the final password.</li>
                        </ol>

                        <h3>Where everything is stored</h3>
                        <ul>
                            <li><b>Everything is stored locally in your browser</b> (using internal storage).</li>
                            <li><b>Nothing is ever sent to a server</b>. Not your data, not your master password, not the generated passwords.</li>
                        </ul>

                        <h3>Advantages</h3>
                        <ul>
                            <li>Since your passwords are neither stored nor sent, it is nearly impossible for anyone to steal them over the internet.</li>
                        </ul>

                        <h3>Disadvantages</h3>
                        <ul>
                            <li>If you forget your master password, there is no way to recover it or recover your passwords. It is the only key.</li>
                        </ul>

                        <h3>Other useful things</h3>
                        <ul>
                            <li>You can <b>export your data</b> (the "ingredients", not the passwords) to another browser.</li>
                            <li>You can create folders to organize your services.</li>
                            <li>It is <b>free</b> and <b>open source</b> (anyone can review its code to verify that it is secure).</li>
                        </ul>

                        <p><b>In short:</b> it is a website that acts as a private password manager, where security is based on the fact that passwords are never stored anywhere and nothing leaves your browser.</p>

                    </div>
                </div>
            </div>

        </div>
    )

}