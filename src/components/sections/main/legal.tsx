const Legal = () => {

    return (
        <div className="relative bg-white/2 border-white/10 w-full h-full squircle-md backdrop-blur-2xl border overflow-hidden">

            <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll">

                <div className="z-50 relative mx-auto flex min-h-full max-w-200 flex-col px-5 py-5 md:p-10">
                    
                    <h2 className="text-xl md:text-3xl font-inter-black mb-5">
                        Legal Notice and Disclaimer
                    </h2>

                    <div className="flex flex-col w-full text">

                        <h3>1. Nature of the Project</h3>
                        <p>
                            This software is an open-source project, distributed under the terms of the <b>MIT License</b>. It is provided "as is", without warranties of any kind, express or implied.
                        </p>

                        <h3>2. Operation and User Autonomy</h3>
                        <p>
                            The system operates entirely within the user's browser. Data is stored locally and <b>is not transmitted to any external server</b>. The author does not have access to, store, or manage the master passwords, generated passwords, or any personal information entered into the application.
                        </p>

                        <h3>3. Sole Responsibility of the User</h3>
                        <p>The user is <b>solely responsible</b> for:</p>

                        <ul>
                            <li>
                                The custody and memorization of their <b>master password</b>. The system does not provide any mechanism for recovering it in case of loss.
                            </li>
                            <li>
                                The use they make of the generated passwords and the information managed
                                through the tool.
                            </li>
                            <li>
                                Understanding how the system works, including that changing the master password or any password generation parameters, such as the character set or password length, will result in different passwords that may no longer match those previously generated or registered.
                            </li>
                            <li>
                                Verifying that the generated passwords meet the requirements and are compatible with the services or accounts where they are intended to be used.
                            </li>
                        </ul>

                        <h3>4. Disclaimer of Liability by the Author</h3>
                        <p>
                            The author of this project <b>is not responsible</b> for:
                        </p>

                        <ul>
                            <li>
                                The loss, leakage, theft, or misuse of passwords or data arising from the user's misuse, incorrect configuration, or misunderstanding of the system.
                            </li>
                            <li>
                                Damages or losses, whether direct or indirect, that may result from the use of this software, including, but not limited to, the inability to access accounts or services due to forgetting the master password or generating a different password from the one previously registered.
                            </li>
                            <li>
                                Security decisions made by the user based on the operation of this tool. It is the user's responsibility to evaluate the suitability of the system for their own security needs.
                            </li>
                        </ul>

                        <h3>5. Acceptance of Terms</h3>
                        <p>
                            The use of this project implies full acceptance of the terms set forth herein. If the user does not agree with them, they should refrain from using the software.
                        </p>

                    </div>
                    
                </div>

            </div>

        </div>
    )

}

export default Legal