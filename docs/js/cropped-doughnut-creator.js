/*elements.js*/
 const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
 function createElement(name, attribs) {
  const xmlns = SVG_NAMESPACE
  const svgElem = document.createElementNS(xmlns, name)

  attribs.forEach(([name, value]) => svgElem.setAttributeNS(null, name, value))

  return svgElem
}

 function createHtmlElement(name, attribs) {
  const element = document.createElement(name)

  attribs.forEach(([name, value]) => element.setAttribute(name, value))

  return element
}


 function setAttributeForSvg(element, name, value) {
  element.setAttributeNS(null, name, value)
}

//
/**drawingCoordinatesinCircle */
 function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  /**
   * Convert a polar coordinate (r,theta) to cartesian (x,y). The calculations are x=r*cos(theta) and y=r*sin(theta).
   * This Method is used in the DoughnutChart. to calculate the x,y position from center of a sliceElement.
   * Usually in Math the origin is Zero, Since the center of the doughnut is the origin, the centerX and centerY are added to the result.
   * @param centerX - Center of Circle X
   * @param centerY - Center of Circle Y
   * @param radius  - Radius of Circle
   * @param angleInDegrees - Angle in Degrees
   * @returns {{x: *, y: *}}
   */
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  }
}

/**
 * Get Drawing Coordinates for an Arc , The arc is a fully closed area in a circle
 *  The arc is drawn from the startAngle to the endAngle
 * The arc is drawn in the clockwise direction
 * @param x - Center of Circle X
 * @param y - Center of Circle Y
 * @param startAngle - Start Angle in Degrees
 * @param endAngle - End Angle in Degrees
 * @param radius - Radius of Circle
 */
 function drawingCoordinatesinCircle(
  { x, y },
  { startAngle, endAngle },
  radius
) {
  const startPoint = polarToCartesian(x, y, radius, startAngle)
  const endPoint = polarToCartesian(x, y, radius, endAngle)

  const arcSweep = endAngle - startAngle <= 180 ? '0' : '1'

  const d = [
    'M',
    endPoint.x,
    endPoint.y,
    'A',
    radius,
    radius,
    0,
    arcSweep,
    0,
    startPoint.x,
    startPoint.y,
    'L',
    x,
    y,
    'L',
    endPoint.x,
    endPoint.y
  ].join(' ')

  return d
}

 function drawingCoordinatesBetweenInnerAndOuterCircle(
  { innerRadius, outerRadius },
  { startAngle, endAngle },
  { x, y }
) {
  const middleRadius = innerRadius + (outerRadius - innerRadius) / 2
  const middleAngle = startAngle + (endAngle - startAngle) / 2
  const drawingCoordinatesForText = drawingCoordinatesinCircle(
    { x, y },
    {
      startAngle,
      endAngle: middleAngle
    },
    middleRadius
  )
  return drawingCoordinatesForText
}


 const PADDING_RATIO = 0.8
 function getHtmlContainerElement({ x, y }, radius, imgUrl, title, textColor) {
  // let {x,y} = polarToCartesian(centerX, centerY, radius, 90);

  const mainElement = createHtmlElement('div', [
    [
      'style',
      'display: table-cell; text-align: center; vertical-align: middle;color:' +
        textColor +
        ';'
    ]
  ])
  const paddedRadius = radius * PADDING_RATIO

  const imgElement = createHtmlElement('img', [
    ['src', imgUrl],
    ['width', paddedRadius],
    ['height', paddedRadius]
  ])
  const breakElement = createHtmlElement('br', [])
  mainElement.appendChild(imgElement)
  mainElement.appendChild(breakElement)
  mainElement.innerHTML += title

  const container = createHtmlElement('div', [
    ['style', 'display: table; font-size: 24px; width: 100%; height: 100%;']
  ])
  container.appendChild(mainElement)

  const paddedX = x - paddedRadius
  const paddedY = y - paddedRadius
  // y = centerY + radius;
  const width = paddedRadius * 2
  const height = paddedRadius * 2
  //  <foreignObject x="20" y="20" width="160" height="160">
  const foreignObject = createElement('foreignObject', [
    ['x', paddedX],
    ['y', paddedY],
    ['width', width],
    ['height', height]
  ])

  foreignObject.appendChild(container)

  return foreignObject
}


function createArc({ x, y }, { startAngle, endAngle }, outerRadius, color) {
  const chartPath = createElement('path', [
    ['fill', color],
    ['class', 'path-container'],
    ['stroke-width', '0']
  ])

  const chartPositionData = drawingCoordinatesinCircle(
    { x, y },
    { startAngle, endAngle },
    outerRadius
  )

  // identify center between start and end angle
  // set label position,and use it

  setAttributeForSvg(chartPath, 'd', chartPositionData)
  return chartPath
}

function createTextDefinition(textId, innerAndOuterRadius, angles, point) {
  const textPathDefinitionElement = createElement('defs', [])

  const pathToDrawTextElement = createElement('path', [
    ['id', textId],
    ['stroke-width', '0']
  ])
  textPathDefinitionElement.appendChild(pathToDrawTextElement)
  const drawingCoordinatesForText =
    drawingCoordinatesBetweenInnerAndOuterCircle(
      innerAndOuterRadius,
      angles,
      point
    )
  pathToDrawTextElement.setAttributeNS(null, 'd', drawingCoordinatesForText)
  return textPathDefinitionElement
}

function createTextElement(textId,{label,labelSize,labelColor}) {
  const textElement = createElement('text', [
    ['font-size', labelSize + 'px'],
    ['fill', labelColor],
    ['rotate', '180']
  ])
  const textPathElement = createElement('textPath', [
    ['href', '#' + textId],
    ['text-anchor', 'top'],
    ['startOffset', '0%']
  ])

  //180 degree reverses stuff
  textPathElement.innerHTML =reverseString(label)
  textElement.appendChild(textPathElement)
  return textElement
}

function getTextElements(id, {label,labelSize,labelColor}, innerAndOuterRadius, angles, point) {
  const textId = 'text' + id
  const textPositionPathElement = createTextDefinition(
    textId,
    innerAndOuterRadius,
    angles,
    point
  )
  const textElement = createTextElement(textId, {label,labelSize,labelColor})

  return {
    textPositionPathElement,
    textElement
  }
}
 function getRandomSixDigitString() {
  const str = '' + Math.floor(Math.random() * (999999 - 1)) + 1
  return str.padStart(6, '0')
}

//  function sliceElement(
//   { startAngle, endAngle },
//   { label, item, color },
//   { x, y },
//   { innerRadius, outerRadius }
// )

 function getSliceElement(
  angles,
  { label, value, color },
  point,
  { innerRadius, outerRadius },
  {labelSize,labelColor}
) {
  const id = 'box' + value + getRandomSixDigitString()
  const container = createElement('a', [
    ['id', 'container' + id],
    ['href', '#'],
    ['style', 'text-decoration: none;']
  ])
  const arc = createArc(point, angles, outerRadius, color)

  container.appendChild(arc)
  const { textPositionPathElement, textElement } = getTextElements(
    id,
    {label,labelSize,labelColor},
    { innerRadius, outerRadius },
    angles,
    point
  )
  container.appendChild(textPositionPathElement)
  container.appendChild(textElement)

  return container
}

function formatLabel(item) {
  const { label } = item
  if (label) return item
  else
    return {
      ...item,
      label: `${item.value}`
    }
}

function formatColor(item, index) {
  const { color } = item
  if (color) return item
  else
    return {
      ...item,
      color: colors[index]
    }
}

 function formatToArrayOfObjects(inputItems) {
  const isNumber = (currentValue) => typeof currentValue === 'number'
  const isAllNumbers = inputItems.every(isNumber)
  let items = inputItems
  if (isAllNumbers) {
    items = inputItems.map((item) => ({ value: item }))
  }
  return items
}
 function reverseString(str) {
  return str.split("").reverse().join("");
}
 function formatItems(inputItems) {
  const items = formatToArrayOfObjects(inputItems)

  const hasValueProperty = (currentValue) => null != currentValue.value
  const isAllValid = items.every(hasValueProperty)
  if (!isAllValid) {
    throw new Error('Invalid Data Found, All items must have a value property')
  }


  const total = items.reduce((acc, item) => acc + item.value, 0)
  return items
    .map((item) => ({
      ...item,
      percentage: (item.value / total) * 100
    }))
    .map(formatLabel)
    .map(formatColor)
}


/**
 *
 * @param {*} point
 * @param {*} angles
 * @param {*} radius
 * @returns
 */



function createArcFrom(point, angles, radius) {
  const innerArc = createElement('path', [])
  const innerArcData = drawingCoordinatesinCircle(point, angles, radius)
  innerArc.setAttributeNS(null, 'd', innerArcData)
  return innerArc
}

const thicknessWithRatio = {
  XXL: 125,
  XL: 100,
  L: 75,
  M: 50,
  S: 35
}

const sizeWithAngles = {
  XXL: [261, 460],
  XL: [241, 480],
  L: [221, 500],
  M: [201, 520],
  S: [181, 540]
}
const colors = [
  '#FF0000',
  '#FF7F00',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#0000FF',
  '#8B00FF'
]

function getCircle({ x, y }, radius, defaultcolor) {
  return createElement('circle', [
    ['cx', x],
    ['cy', y],
    ['r', radius],
    ['fill', defaultcolor]
  ])
}

 function DoughnutElement(
  items,
  { radius, title, thicknessSize, gapSize, backgroundColor, imgUrl,  titleColor,labelSize,labelColor }
) {
  const thicknessOfCircle = thicknessWithRatio[thicknessSize]
  const totalSize = (radius + thicknessOfCircle) * 2
  const x = totalSize / 2
  const y = totalSize / 2
  const outerRadius = radius + thicknessOfCircle
  const sizeWithAngle = sizeWithAngles[gapSize]
  const [startAngle, endAngle] = sizeWithAngle
  const total = (endAngle - startAngle) / 100
  const percentageToDegree = (percent) => percent * total

  const container = createElement('g', [])

  const innerArc = createArcFrom({ x, y }, { startAngle, endAngle }, radius)
  const outerArc = createArcFrom(
    { x, y },
    { startAngle, endAngle },
    outerRadius
  )

  container.appendChild(outerArc)
  container.appendChild(innerArc)

  let initAngle = startAngle


  const formattedItems = formatItems(items)

  formattedItems.forEach((item, index) => {
    let {label, value,color,percentage} = item
    // if(undefined == value){
    //   label = "" + item
    //   value = item;
    //   color =colors[index]
    // }else {
    //
    //   let formattedItem = item || { label: '' +item.value, color: colors[index] }
    //   label = formattedItem.label
    //   color = formattedItem.color
    //   value = formattedItem.value
    // }

    //console.log(label)
    //console.log(color)
    //console.log(value)
    const endAngle = initAngle + percentageToDegree(percentage)

    const currentBoxElement = getSliceElement(
      { startAngle: initAngle, endAngle },
      {label, value,color},
      { x, y },
      { innerRadius: radius, outerRadius: outerRadius },{labelSize,labelColor}
    )

    container.appendChild(currentBoxElement)
    initAngle = endAngle
  })

  const htmlContainerElement = getHtmlContainerElement(
    { x, y },
    radius,
    imgUrl,
    title,
    titleColor
  )
  const backgroundCircle = getCircle({ x, y }, radius, backgroundColor)

  container.appendChild(backgroundCircle)
  container.appendChild(htmlContainerElement)

  const root = createElement('svg', [
    ['width', totalSize],
    ['height', totalSize]
  ])
  root.appendChild(container)
  return root
}
