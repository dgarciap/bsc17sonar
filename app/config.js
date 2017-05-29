var config = {
    WS_HOST: "ws://localhost:3000",
    POSITION_SEND_INTERVAL: 1000,
    UPDATE_TILES_INTERVAL: 3000,
    WITH_SPHERE_BARRIER: true,

    //Percentage. When the user enters the tileLoadArea in one direction the adjacent tile loads
    //or a bording indicating that there is no tile. It should be less than 0.5 to avoid
    //implementation problems.
    tileLoadArea: 0.35,
};