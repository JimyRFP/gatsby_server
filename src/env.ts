const pe=process.env;
export const ENV={
    build:{
        auth:{
            user:pe.GS_USERNAME||"user",
            pass:pe.GS_USERPASS||"pass",
        },
    },
    gatsby:{
       path:pe.GS_GATSBYPATH||"gatsby",
    },
    public:{
       path:pe.GS_PUBLICPATH||"public",
    },
    debug:true,
    verbose:true,
    port:pe.GS_PORT||80,
}