// Handles form submission and evaluates the linear iteration method
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('dropdownToggle')
  const content = document.getElementById('dropdownContent')
  if (toggle && content) {
    toggle.addEventListener('click', function () {
      const isOpen = content.classList.toggle('open')
      toggle.classList.toggle('open', isOpen)
      toggle.textContent = isOpen
        ? 'Optional Parameters ▲'
        : 'Optional Parameters ▼'
    })
  }

  const form = document.getElementById('linear-form')
  if (!form) return

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    let gxStr = document.getElementById('gx').value
    let fxStr = document.getElementById('fx').value
    const x0 = parseFloat(document.getElementById('x0').value)
    const resultadoDiv = document.getElementById('resultado')
    const maxIterInput = document.getElementById('maxIter').value
    const epsilonInput = document.getElementById('epsilon').value
    // Get stopping criteria from checkboxes
    const stopRootDiff = document.getElementById('stopRootDiff').checked
    const stopFuncDiff = document.getElementById('stopFuncDiff').checked
    const stopFx = document.getElementById('stopFx').checked
    const stopCriteria = {
      rootDiff: stopRootDiff,
      funcDiff: stopFuncDiff,
      fxError: stopFx,
    }
    const maxIter = maxIterInput ? parseInt(maxIterInput) : 100
    const epsilon = epsilonInput ? parseFloat(epsilonInput) : 1e-7

    // Replace ^ with Math.pow for power operations (e.g., x^3 -> Math.pow(x,3))
    gxStr = gxStr.replace(
      /([a-zA-Z0-9_.()]+)\s*\^\s*([\-]?[0-9.]+)/g,
      'Math.pow($1,$2)'
    )

    fxStr = fxStr.replace(
      /([a-zA-Z0-9_.()]+)\s*\^\s*([\-]?[0-9.]+)/g,
      'Math.pow($1,$2)'
    )

    let g
    try {
      g = new Function('x', `return ${gxStr}`)
      g(x0)
    } catch (err) {
      resultadoDiv.textContent =
        'Invalid function! Please check the expression.'
      return
    }

    let f
    try {
      f = new Function('x', `return ${fxStr}`)
    } catch (err) {
      resultadoDiv.textContent =
        'Invalid original function! Please check the expression.'
      return
    }

    let root
    try {
      root = linearIterationMethod(f, g, x0, epsilon, maxIter, stopCriteria)
    } catch (err) {
      resultadoDiv.textContent = 'Error during calculation: ' + err.message
      return
    }

    if (root === undefined) {
      resultadoDiv.textContent = 'No root found or method did not converge.'
    } else {
      resultadoDiv.textContent = `x = ${root}`
      resultadoDiv.classList.remove('blink')
      void resultadoDiv.offsetWidth // trigger reflow for animation restart
      resultadoDiv.classList.add('blink')
    }
  })
})

function linearIterationMethod(
  f,
  g,
  x0,
  epsilon = 1e-7,
  maxIterations,
  stopCriteria
) {
  let iteration = 1
  let xOld = x0
  let xNew
  let fxError = Infinity
  let rootDiff
  let funcDiff
  let stop = false

  if (
    !stopCriteria.rootDiff &&
    !stopCriteria.funcDiff &&
    !stopCriteria.fxError &&
    maxIterations === Infinity
  ) {
    throw new Error(
      'At least one stopping criterion must be enabled or maxIterations must be finite.'
    )
  }

  do {
    xNew = g(xOld)
    if (stopCriteria.rootDiff) rootDiff = Math.abs((xNew - xOld) / xNew)
    if (stopCriteria.funcDiff) funcDiff = Math.abs(f(xNew) - f(xOld) / f(xNew))
    if (stopCriteria.fxError) fxError = Math.abs(f(xNew))

    xOld = xNew
    iteration++

    stop =
      (stopCriteria.rootDiff && rootDiff * 100 <= epsilon) ||
      (stopCriteria.funcDiff && funcDiff * 100 <= epsilon) ||
      (stopCriteria.fxError && fxError <= epsilon) ||
      iteration > maxIterations
  } while (!stop)

  return xNew
}
