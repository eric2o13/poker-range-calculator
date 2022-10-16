//Lib
const compose   = (...fns) => x => fns.reduceRight((v, f) => f(v), x)
const concat    = a => b => a.concat(b)
const delay     = s => new Promise(resolve => setTimeout(resolve, s))
const diff      = a => b => Math.abs(a - b)
const id        = x => x
const ifelse    = c => t => f => x => c(x) ? t(x) : f(x)
const is        = a => b => a === b
const map       = f => xs => xs.map(f)
const not       = a => b => a !== b
const pipe      = (...fns) => x => fns.reduce((acc, f) => f(acc), x)

//State
const STATE = {}
STATE.ranges = Object.freeze([
    ['AA', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s'],
    ['AKo', 'KK', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s'],
    ['AQo', 'KQo', 'QQ', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s'],
    ['AJo', 'KJo', 'QJo', 'JJ', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s'],
    ['ATo', 'KTo', 'QTo', 'JTo', 'TT', 'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s'],
    ['A9o', 'K9o', 'Q9o', 'J9o', 'T9o', '99', '98s', '97s', '96s', '95s', '94s', '93s', '92s'],
    ['A8o', 'K8o', 'Q8o', 'J8o', 'T8o', '98o', '88', '87s', '86s', '85s', '84s', '83s', '82s'],
    ['A7o', 'K7o', 'Q7o', 'J7o', 'T7o', '97o', '87o', '77', '76s', '75s', '74s', '73s', '72s'],
    ['A6o', 'K6o', 'Q6o', 'J6o', 'T6o', '96o', '86o', '76o', '66', '65s', '64s', '63s', '62s'],
    ['A5o', 'K5o', 'Q5o', 'J5o', 'T5o', '95o', '85o', '75o', '65o', '55', '54s', '53s', '52s'],
    ['A4o', 'K4o', 'Q4o', 'J4o', 'T4o', '94o', '84o', '74o', '64o', '54o', '44', '43s', '42s'],
    ['A3o', 'K3o', 'Q3o', 'J3o', 'T3o', '93o', '83o', '73o', '63o', '53o', '43o', '33', '32s'],
    ['A2o', 'K2o', 'Q2o', 'J2o', 'T2o', '92o', '82o', '72o', '62o', '52o', '42o', '32o', '22'],
])
STATE.selected = []
STATE.percentage = 0

//Web helpers
const text      = content => document.createTextNode(content)
const element   = tag => document.createElement(tag)

const addClass  = className => element => {
    element.classList.add(className)
    return element
}

const setId = id => element => {
    element.id = id
    return element
}

const append = node => element => {
    element.appendChild(node)
    return element
}

const value = value => element => {
    element.value = value
    return element
}

const attribute = attr => value => element => {
    element.setAttribute(attr, value)
    return element
}

const update = content => element => {
    let child = element.lastElementChild
    while (child) {
        element.removeChild(child)
        child = element.lastElementChild
    }
    element.appendChild(content)
    return content
}

//App helpers
const maybeAddClasses = input => state => pipe(
    ifelse( el => state.selected.some(is(input)))
        (addClass('selected'))(id),
    ifelse( el => input.length === 2)
        (addClass('pair'))(id),
    ifelse( el => suited(input))
        (addClass('suited'))(id)
)

const cell = input => state => compose(
    maybeAddClasses(input)(state),
    append(text(input)),
    addClass('cell'),
)(element('div')) 

const row = n => state => {
    const elem = compose(addClass('row'))(element('div'))
    state.ranges[n].forEach((i) => {
        append(cell(i)(state))(elem)
    })
    return elem
}

const rows = state => {
    const elem = compose(addClass('rows'))(element('div'))
    state.ranges.forEach((a, i) => {
        append(row(i)(state))(elem)
    })
    return elem
}

const form = state => {
    const elem = compose(addClass('form'))(element('form'))
    const range = pipe(
        setId('percentage-range'),
        addClass('p-10'),
        attribute("type")("range"),
        attribute("min")(0),
        attribute("max")(100),
        attribute("steps")(0.01),
        value(state.percentage)
    )(element("input"))

    const input = pipe(
        setId('percentage-text'),
        addClass('p-10'),
        attribute("type")("number"),
        attribute("min")(0),
        attribute("max")(100),
        value(state.percentage)
    )(element('input'))

    return pipe(
        addClass('p-10'),
        append(range),
        append(input),
    )(elem)
}

const percentage = xs => state => {
    const max = state.ranges.flat(1).length
    const min = xs.length 
    const percentage = (min/max) * 100
    return Math.round(percentage * 100) / 100
}

const bool = x => x ? 1 : 0

const suited = x => x.charAt(x.length - 1) === 's'

const percentageFromList = xs => percentage => 
    xs.slice(0, Math.ceil(xs.length * percentage / 100))

const sortKey = x => compose(
    concat(`#${x.aces}`),
    concat(`#${x.kings}`),
    concat(`#${x.Aks}`),
    concat(`#${x.Ak}`),
    concat(`#${x.highPair}`),
    concat(`#${x.highCardFirstRow}`),
    concat(`#${x.faceCards}`),
    concat(`#${x.nineAndAbove}`),
    concat(`#${x.ace}`),
    concat(`#${x.lowPair}`),
    concat(`#${x.suitedConnectors}`),
    concat(`#${x.suitedFaceCards}`),
    concat(`#${x.sixAndAbove}`),
    concat(`#${x.suited}`),
    concat(`#${x.connectors}`),
    concat(`#${x.faceCard}`),
    concat(`#${x.diff}`),
    concat(`#${x.rowPlusCell}`),
)('')

const evolveCell = x => row => col => ({
    card: x,
    row: row,
    col: col,
    aces: bool(col === 0 && row === 0),
    kings: bool(col === 1 && row === 1),
    Aks: bool(col === 1 && row === 0),
    Ak: bool(col === 0 && row === 1),
    pair: bool(x.length === 2),
    lowPair: bool(x.length === 2 && row > 8),
    highPair: bool(x.length === 2 && row < 9),
    nineAndAbove: bool(row < 6 && col < 6),
    sixAndAbove: bool(row < 8 && col < 8),
    highCardFirstRow: bool(row === 0 && col < 5),
    suited: bool(suited(x)),
    faceCards: bool(row < 4 && col < 5),
    faceCard: bool(row < 4 || col < 5),
    suitedFaceCards: bool((row < 4 || col < 5) && suited(x)),
    connectors: bool(diff(row)(col) === 1),
    suitedConnectors: bool(suited(x) && diff(row)(col) === 1), 
    ace: bool(col === 0 || row === 0),
    diff: 100 - diff(row)(col),
    rowPlusCell: 100 - (row + col),
})

const sortRanges = xsxs => 
    xsxs.map((row, i) => 
        row.map((x, k) => evolveCell(x)(i)(k))
            .map((x) => ({
                ...x, sort: sortKey(x) 
        })))
        .flat(1)
        .sort((a,b) => a.sort > b.sort ? -1 : a.sort < b.sort ? 1 : 0)
        .map((x) => x.card)


//App
const view = state => compose(
    append(form(state)),
    append(rows(state)),
    addClass('bg-dark')
)(element('section'))

const app = state => output => dispatch => {
    update(view(state))(output)
    dispatch(state)
}

const nextSelected = e => state => {
    const hand = e.target.innerText
    const selected = state.selected.some(is(hand)) ? 
        state.selected.filter(not(hand)) :
        [...state.selected,hand]

    app({
        ...state,
        selected: selected,
        percentage: percentage(selected)(state),
    })($app)(events)

}

const nextAutoSelected = e => state => {
    const val = e.target.value
    const ranges = sortRanges(state.ranges)      
      
    app({
        ...state,
        selected: percentageFromList(ranges)(val),
        percentage: percentage(percentageFromList(ranges)(val))(state),
    })($app)(events)

}

const $app = document.getElementById('app')
const events = state => {
    const range = document.querySelector("#percentage-range")
    range.oninput = (e) => nextAutoSelected(e)(state)

    const number = document.querySelector('#percentage-text')
    number.onkeyup = (e) => delay(500).then(() => {
        nextAutoSelected(e)(state)
    })

    const $cells = document.querySelectorAll('.cell')
    $cells.forEach((o) => { 
        o.onclick = (e) => nextSelected(e)(state)
    })
}

//Bootstrap the application
app(STATE)($app)(events)
