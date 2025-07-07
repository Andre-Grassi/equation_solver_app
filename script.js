let xl
let xu
let f

// Handles form submission and evaluates the nonlinear function
document.getElementById('solver-form').addEventListener('submit', function (e) {
  e.preventDefault()
  let funcaoStr = document.getElementById('funcao').value
  const xl = parseFloat(document.getElementById('xl').value)
  const xu = parseFloat(document.getElementById('xu').value)
  const resultadoDiv = document.getElementById('resultado')

  // Replace ^ with Math.pow for power operations (e.g., x^3 -> Math.pow(x,3))
  funcaoStr = funcaoStr.replace(
    /([a-zA-Z0-9_.()]+)\s*\^\s*([\-]?[0-9.]+)/g,
    'Math.pow($1,$2)'
  )

  // Function to evaluate the user-provided expression
  try {
    f = new Function('x', `return ${funcaoStr}`)
    // Test the function to ensure it's valid
    f(xl)
    f(xu)
  } catch (err) {
    resultadoDiv.textContent = 'Invalid function! Please check the expression.'
    return
  }
})

function bissectionMethod(f, xl, xu, epsilon = 1e-7, maxIterations = Infinity) {
  let iteration = 1
  let relativeError = Infinity
  let xm_old = Infinity
  do {
    let xm = (xl + xu) / 2

    // Test the function at the midpoint
    if (f(xm) === 0) {
      return xm // Found exact root
    }

    // Check if the root is in the left or right half
    if (f(xl) * f(xm) < 0) {
      xu = xm // Root is in the left half
    } else {
      xl = xm // Root is in the right half
    }

    iteration++
    relativeError = Math.abs((xm - xm_old) / xm) * 100
    xm_old = xm
  } while (iteration <= maxIterations && relativeError > epsilon)

  return xm
}
