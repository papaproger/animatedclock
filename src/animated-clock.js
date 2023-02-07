'use strict';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*      Animated Clock Script, version: 1.0, XX.03.2023      */
/* Copyright © 2023 Sergey Shlyakhtin. All rights reserved.  */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* * * * * * * * * * * * CUSTOM PARAMS * * * * * * * * * * * */

var animatedClock = {

    // create any sequence of transitions:
    transitions: [{
        timings: {
            delay: 0, // delay: 0,
            duration: 5000
        },
        extraRotationValues: {
            hValue: -1, // -360deg
            mValue: 1 // +360deg
            //sValue: 0,
        }
    }, {
        timings: {
            delay: 2000,
            duration: 1000
        },
        extraRotationValues: {
            hValue: 1,
            mValue: -1,
            sValue: 0
        }
    }, {
        timings: {
            delay: 0,
            duration: 1000
        },
        extraRotationValues: {
            hValue: -1,
            mValue: 2,
            sValue: 0
        }
    }],

    // PRIVATE INITIALIZING PROPERTIES (no changes to them):
    _hands: null,
    _currentAngles: {
        hAngle: 0,
        mAngle: 0,
        sAngle: 0
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

};var getTimeObject = function getTimeObject() {
    var milliseconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var is24Houred = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


    var seconds = Math.trunc(milliseconds / 1000) % (is24Houred ? 86400 : 43200);

    return {
        hours: Math.floor(seconds / 3600),
        minutes: Math.floor(seconds % 3600 / 60),
        seconds: seconds % 3600 % 60
    };
};

var getNextAngles = function getNextAngles() {
    var currentAngles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        hAngle: 0,
        mAngle: 0,
        sAngle: 0
    };
    var transitionDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var transitionDelay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var extraRotationValues = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
        hValue: 0,
        mValue: 0,
        sValue: 0
    };


    var relativeStopTime = getTimeObject(transitionDelay + transitionDuration);

    return {
        hAngle: // regardless of seconds
        relativeStopTime.hours * 30 + relativeStopTime.minutes * 0.5 + currentAngles.hAngle + (extraRotationValues.hValue === undefined ? 0 : extraRotationValues.hValue) * 360,
        mAngle: relativeStopTime.minutes * 6 + relativeStopTime.seconds * 0.1 + currentAngles.mAngle + (extraRotationValues.mValue === undefined ? 0 : extraRotationValues.mValue) * 360,
        sAngle: relativeStopTime.seconds * 6 + currentAngles.sAngle + (extraRotationValues.sValue === undefined ? 0 : extraRotationValues.sValue) * 360
    };
};

var windHands = function windHands(currentAngles) {
    var transitionDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2000;
    var transitionDelay = arguments[2];
    var extraRotationValues = arguments[3];


    animatedClock._hands.hourLayer.style.transition = animatedClock._hands.minuteLayer.style.transition = animatedClock._hands.secondHand.style.transition = transitionDuration === 0 ? 'none' : 'transform ' + transitionDuration + 'ms ease';

    var angles = getNextAngles(currentAngles, transitionDuration, transitionDelay, extraRotationValues);

    animatedClock._hands.hourLayer.style.transform = 'rotate(' + angles.hAngle + 'deg)';
    animatedClock._hands.minuteLayer.style.transform = 'rotate(' + angles.mAngle + 'deg)';
    animatedClock._hands.secondHand.style.transform = 'rotate(' + angles.sAngle + 'deg)';

    return angles;
};

var animateHands = function animateHands() {
    var currentAngles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        hAngle: 0,
        mAngle: 0,
        sAngle: 0
    };


    animatedClock._hands.hourLayer.animate([{ transform: 'rotate(' + currentAngles.hAngle + 'deg)' }, { transform: 'rotate(' + (currentAngles.hAngle + 360) + 'deg)' }], {
        duration: 43200000,
        iterations: Infinity
    });

    animatedClock._hands.minuteLayer.animate([{ transform: 'rotate(' + currentAngles.mAngle + 'deg)' }, { transform: 'rotate(' + (currentAngles.mAngle + 360) + 'deg)' }], {
        duration: 3600000,
        iterations: Infinity
    });

    animatedClock._hands.secondHand.animate([{ transform: 'rotate(' + currentAngles.sAngle + 'deg)' }, { transform: 'rotate(' + (currentAngles.sAngle + 360) + 'deg)' }], {
        duration: 60000,
        iterations: Infinity
    });
};

var transitionUnitFabric = function transitionUnitFabric(duration, currentDelay, extraRotationValues, transitionUnitShot) {
    var nextDelay = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;


    return function (currentAngles) {
        animatedClock._currentAngles = windHands(currentAngles, duration, currentDelay, extraRotationValues);
        setTimeout(function () {
            return transitionUnitShot(animatedClock._currentAngles);
        }, duration + nextDelay);
    };
};

var startClock = function startClock() {

    animatedClock._hands = {
        hourLayer: document.querySelector('div[layer="hour"]'),
        minuteLayer: document.querySelector('div[layer="minute"]'),
        secondHand: document.querySelector('div[hand="second"]')
    };

    var transitionUnitShot = animateHands;
    var startDelay = void 0;

    if (animatedClock.transitions === undefined || animatedClock.transitions.length === 0) {
        transitionUnitShot(animatedClock._currentAngles = getNextAngles(animatedClock._currentAngles, 0, Date.now() - new Date().getTimezoneOffset() * 60000));
    } else {

        for (var i = animatedClock.transitions.length - 1; i >= 0; i--) {

            var duration = animatedClock.transitions[i].timings === undefined || animatedClock.transitions[i].timings.duration === undefined ? 0 : animatedClock.transitions[i].timings.duration;

            var currentDelay = animatedClock.transitions[i].timings === undefined || animatedClock.transitions[i].timings.delay === undefined ? 0 : animatedClock.transitions[i].timings.delay;

            if (i === 0) {
                startDelay = currentDelay;
                currentDelay += Date.now() - new Date().getTimezoneOffset() * 60000;
            }

            var extraRotationValues = animatedClock.transitions[i].extraRotationValues === undefined ? {
                hValue: 0,
                mValue: 0,
                sValue: 0
            } : animatedClock.transitions[i].extraRotationValues;

            var nextDelay = i === animatedClock.transitions.length - 1 || animatedClock.transitions[i + 1].timings === undefined || animatedClock.transitions[i + 1].timings.delay === undefined ? 0 : animatedClock.transitions[i + 1].timings.delay;

            transitionUnitShot = transitionUnitFabric(duration, currentDelay, extraRotationValues, transitionUnitShot, nextDelay);
        }

        setTimeout(function () {
            return transitionUnitShot(animatedClock._currentAngles);
        }, startDelay);
    }
};

window.addEventListener('load', function () {
    return startClock();
});