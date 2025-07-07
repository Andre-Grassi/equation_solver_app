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
    const stopRel = document.getElementById('stopRel').checked
    const stopAbs = document.getElementById('stopAbs').checked
    const stopFx = document.getElementById('stopFx').checked
    const stopCriteria = { relative: stopRel, absolute: stopAbs, fx: stopFx }
    const maxIter = maxIterInput ? parseInt(maxIterInput) : 50
    const epsilon = epsilonInput ? parseFloat(epsilonInput) : 1e-6

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

    const root = linearIterationMethod(f, g, x0, epsilon, maxIter, stopCriteria)
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
  maxIterations = Infinity,
  stopCriteria = { relative: true, absolute: false, fx: false }
) {
  let iteration = 1
  let xOld = x0
  let xNew
  let converged = false
  let relError = Infinity
  let absError = Infinity
  let fxError = Infinity

  do {
    xNew = g(xOld)
    relError = Math.abs((xNew - xOld) / (xNew || 1))
    absError = Math.abs(xNew - xOld)
    fxError = Math.abs(f(xNew))
    if (
      (stopCriteria.relative && relError <= epsilon) ||
      (stopCriteria.absolute && absError <= epsilon) ||
      (stopCriteria.fx && fxError <= epsilon)
    ) {
      converged = true
      break
    }
    xOld = xNew
    iteration++
  } while (iteration <= maxIterations)

  return converged ? xNew : undefined
}
