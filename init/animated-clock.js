/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/*      Animated Clock Script, version: 1.0, 12.02.2023      */
/* Copyright © 2023 Sergey Shlyakhtin. All rights reserved.  */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* * * * * * * * * * * * CUSTOM PARAMS * * * * * * * * * * * */

let animatedClock = {

    // create any sequence of transitions:
    transitions: [
        {
            timings: {
                //delay: 0,
                duration: 3000,
            },
            extraRotationValues: {
                hValue: -1, // -360deg
                mValue: 1,  // +360deg
                //sValue: 0,
            },
        },
        {
            timings: {
                delay: 2000,
                duration: 1000,
            },
            extraRotationValues: {
                hValue: 1,
                mValue: -1,
                sValue: 0,
            },
        },
        {
            timings: {
                delay: 0,
                duration: 1000,
            },
            extraRotationValues: {
                hValue: -1,
                mValue: 2,
                sValue: 0,
            },
        },
    ],

    // PRIVATE INITIALIZING PROPERTIES (no changes to them):
    _hands: {
        hourLayer: null,
        minuteLayer: null,
        secondHand: null
    },
    _currentAngles: {
        hAngle: 0,
        mAngle: 0,
        sAngle: 0
    },
    _timezoneOffset: new Date().getTimezoneOffset()
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const getTimeObject = (milliseconds = 0, is24Houred = false) => {

    const seconds = Math.trunc(Math.abs(milliseconds) / 1000) % (is24Houred ? 86400 : 43200)

    return {
        hours: Math.floor(seconds / 3600),
        minutes: Math.floor((seconds % 3600) / 60),
        seconds: (seconds % 3600) % 60
    }
}

const getNextAngles = (currentAngles, transitionDuration = 0, transitionDelay = 0, extraRotationValues = {
    hValue: 0,
    mValue: 0,
    sValue: 0
}) => {

    const relativeStopTime = getTimeObject(Math.abs(transitionDelay) + Math.abs(transitionDuration))

    return {
        hAngle: // regardless of seconds
            relativeStopTime.hours * 30 + relativeStopTime.minutes * 0.5 +
            currentAngles.hAngle +
            (extraRotationValues.hValue || 0) * 360,
        mAngle:
            relativeStopTime.minutes * 6 + relativeStopTime.seconds * 0.1 +
            currentAngles.mAngle +
            (extraRotationValues.mValue || 0) * 360,
        sAngle:
            relativeStopTime.seconds * 6 +
            currentAngles.sAngle +
            (extraRotationValues.sValue || 0) * 360
    }
}

const windHands = (clock, step = 0) => {

    step = Math.abs(step)

    let duration
    let delay

    // a.b.c?.d
    if (!clock.transitions[step].timings) duration = delay = 0
    else {
        duration = Math.abs(clock.transitions[step].timings.duration) || 0
        delay = Math.abs(clock.transitions[step].timings.delay) || 0
    }

    if (step <= 0) delay += Date.now() - clock._timezoneOffset * 60000

    clock._hands.hourLayer.style.transition =
        clock._hands.minuteLayer.style.transition =
        clock._hands.secondHand.style.transition = duration <= 0
            ? 'none'
            : `transform ${duration}ms ease`

    clock._currentAngles = getNextAngles(clock._currentAngles, duration, delay, clock.transitions[step].extraRotationValues)

    clock._hands.hourLayer.style.transform = `rotate(${clock._currentAngles.hAngle}deg)`
    clock._hands.minuteLayer.style.transform = `rotate(${clock._currentAngles.mAngle}deg)`
    clock._hands.secondHand.style.transform = `rotate(${clock._currentAngles.sAngle}deg)`

    let nextDelay

    // a.b.c?.d
    if (step >= clock.transitions.length - 1 || !clock.transitions[step + 1].timings) nextDelay = 0
    else nextDelay = clock.transitions[step + 1].timings.delay || 0

    return duration + nextDelay
}

const animateHands = (clock) => {

    clock._hands.hourLayer.animate([
        { transform: `rotate(${clock._currentAngles.hAngle}deg)` },
        { transform: `rotate(${clock._currentAngles.hAngle + 360}deg)` }
    ], {
        duration: 43200000,
        iterations: Infinity
    })

    clock._hands.minuteLayer.animate([
        { transform: `rotate(${clock._currentAngles.mAngle}deg)` },
        { transform: `rotate(${clock._currentAngles.mAngle + 360}deg)` }
    ], {
        duration: 3600000,
        iterations: Infinity
    })

    clock._hands.secondHand.animate([
        { transform: `rotate(${clock._currentAngles.sAngle}deg)` },
        { transform: `rotate(${clock._currentAngles.sAngle + 360}deg)` }
    ], {
        duration: 60000,
        iterations: Infinity
    })
}

const transitionUnitFabric = (step, transitionUnitShot) => {

    return (clock) => setTimeout(() => transitionUnitShot(clock), windHands(clock, step))
}

const startClock = (clock) => {

    if (!clock || !clock._hands) return false

    let transitionUnitShot = animateHands

    // KISS
    if (clock.transitions.length === 0) {
        clock._currentAngles = getNextAngles(clock._currentAngles, 0, Date.now() - clock._timezoneOffset * 60000)
        transitionUnitShot(clock)
    } else {
        let startDelay

        // a.b.c?.d
        if (!clock.transitions[0].timings) startDelay = 0
        else startDelay = clock.transitions[0].timings.delay || 0

        for (let i = clock.transitions.length - 1; i >= 0; i--) {
            transitionUnitShot = transitionUnitFabric(i, transitionUnitShot)
        }

        setTimeout(() => transitionUnitShot(clock), startDelay)
    }

    return true
}

window.addEventListener('load', () => {

    animatedClock._hands = {
        hourLayer: document.querySelector(`div[layer="hour"]`),
        minuteLayer: document.querySelector(`div[layer="minute"]`),
        secondHand: document.querySelector(`div[hand="second"]`)
    }
    
    startClock(animatedClock)
})