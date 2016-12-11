"use strict"

/**
 * The Player class is a player within the game. It contains simple information
 * such as position, speed, and heading.
 */
class Player {
    /**
     * Constructor that takes in a player ID and starting position.
     */
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    /**
     * Returns the angle for where the ship is heading in radians.
     */
    getHeading() {
        return this.heading || 0;
    }

    /**
     * Returns the thrust of the ship, which is essentially how fast it is
     * moving in the game.
     */
    getThrust() {
        return this.thrust || 0;
    }

    /**
     * Moves the ship by one step forward in the game.
     */
    update() {
        var heading = getHeading();
        var thrust = getThrust();

        this.x += cos(heading) * thrust;
        this.y += sin(heading) * thrust;
    }

    /**
     * Returns whether or nor two player instances are the same.
     */
    equals(other) {
        return other.id === this.id;
    }
}

exports.Player = Player