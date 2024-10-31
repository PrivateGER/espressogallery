// app.d.ts

/// <reference types="lucia" />
declare namespace Lucia {
    type Auth = import("./src/lib/lucia").Auth;
    type DatabaseUserAttributes = {
        username: string;
        role: import("@prisma/client").Role;
    };
    type DatabaseSessionAttributes = {};
}
