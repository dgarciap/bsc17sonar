var config = {
    WS_HOST: "ws://visualization-case.bsc.es/17sonarvrsrv",
    HTTP_HOST: "http://visualization-case.bsc.es/17sonarvrsrv",
    POSITION_SEND_INTERVAL: 1000,
    UPDATE_TILES_INTERVAL: 3000,
    WITH_SPHERE_BARRIER: true,
    WITH_USER_SHADOW: false,
    REPORT_POSITION: false,
    REPORT_EVERY: 500,

    //Percentage. When the user enters the tileLoadArea in one direction the adjacent tile loads
    //or a bording indicating that there is no tile. It should be less than 0.5 to avoid
    //implementation problems.
    tileLoadArea: 0.45,
};