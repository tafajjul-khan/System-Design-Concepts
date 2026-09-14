import * as soap from "soap";

import {
    type CreateUserArgs,
    type GetUsersArgs,
    type UpdateUserArgs,
    type PatchUserArgs
} from "./types.js";

const wsdlUrl =
    "http://localhost:8000/userservice?wsdl";

async function runClientTests() {

    try {

        console.log(
            "Connecting to SOAP Server..."
        );

        const client =
            await soap.createClientAsync(
                wsdlUrl
            );

        console.log(
            "\nAvailable methods:"
        );

        console.log(
            client.describe()
        );


        // =====================================
        // CREATE
        // =====================================

        console.log(
            "\n--- 1. CREATE USER ---"
        );

        const newUserData: CreateUserArgs = {
            name: "David",
            email: "david@example.com",
            role: "User"
        };

        const [createResult] =
            await (client as any)
                .createUserAsync(
                    newUserData
                );

        console.log(
            "Created:",
            JSON.stringify(
                createResult,
                null,
                2
            )
        );


        // =====================================
        // GET USERS
        // =====================================

        console.log(
            "\n--- 2. GET USERS ---"
        );

        const queryParams: GetUsersArgs = {
            page: 1,
            limit: 2,
            filterRole: "User"
        };

        const [queryResult] =
            await (client as any)
                .getUsersAsync(
                    queryParams
                );

        console.log(
            "Users:",
            JSON.stringify(
                queryResult,
                null,
                2
            )
        );


        // =====================================
        // GET USER BY ID
        // =====================================

        console.log(
            "\n--- 3. GET USER BY ID ---"
        );

        const [userResult] =
            await (client as any)
                .getUserByIdAsync({
                    id: "1"
                });

        console.log(
            "User:",
            JSON.stringify(
                userResult,
                null,
                2
            )
        );


        // =====================================
        // UPDATE
        // =====================================

        console.log(
            "\n--- 4. UPDATE USER ---"
        );

        const updateData: UpdateUserArgs = {
            id: "1",
            name: "Alice Smith",
            email: "alice.smith@example.com",
            role: "SuperAdmin"
        };

        const [updateResult] =
            await (client as any)
                .updateUserAsync(
                    updateData
                );

        console.log(
            "Updated:",
            JSON.stringify(
                updateResult,
                null,
                2
            )
        );


        // =====================================
        // PATCH
        // =====================================

        console.log(
            "\n--- 5. PATCH USER ---"
        );

        const patchData: PatchUserArgs = {
            id: "2",
            role: "Manager"
        };

        const [patchResult] =
            await (client as any)
                .patchUserAsync(
                    patchData
                );

        console.log(
            "Patched:",
            JSON.stringify(
                patchResult,
                null,
                2
            )
        );


        // =====================================
        // DELETE
        // =====================================

        console.log(
            "\n--- 6. DELETE USER ---"
        );

        const [deleteResult] =
            await (client as any)
                .deleteUserAsync({
                    id: "3"
                });

        console.log(
            "Deleted:",
            JSON.stringify(
                deleteResult,
                null,
                2
            )
        );


        console.log(
            "\n✅ All SOAP tests completed."
        );

    } catch (error) {

        console.error(
            "\n❌ Execution failed:"
        );

        console.error(error);
    }
}

runClientTests();