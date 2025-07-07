// Handles Gauss Elimination form and solution display
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('gauss-form')
  const matrixInputsDiv = document.getElementById('matrix-inputs')
  const matrixSizeInput = document.getElementById('matrix-size')
  const inputModeSelect = document.getElementById('input-mode')
  const matrixTextareaDiv = document.getElementById('matrix-textarea')
  const matrixAtext = document.getElementById('matrixAtext')
  const vectorBtext = document.getElementById('vectorBtext')
  const matrixSizeLabel = document.getElementById('matrix-size-label')
  if (!form || !matrixInputsDiv || !matrixSizeInput) return

  function renderMatrixInputs(n) {
    let html = '<div style="display:flex; gap:16px;">'
    html +=
      '<div style="display:grid; grid-template-columns:repeat(' +
      n +
      ',40px); gap:6px;">'
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        html += `<input type="number" step="any" class="matrixA" data-row="${i}" data-col="${j}" style="width:40px;" required />`
      }
    }
    html += '</div>'
    html +=
      '<span style="align-self:center; font-size:1.3em; margin:0 8px;">×</span>'
    html +=
      '<div style="display:grid; grid-template-rows:repeat(' +
      n +
      ',40px); gap:6px;">'
    for (let i = 0; i < n; i++) {
      html += `<input type="number" step="any" class="vectorB" data-row="${i}" style="width:40px;" required />`
    }
    html += '</div>'
    html += '</div>'
    matrixInputsDiv.innerHTML = html
  }

  function getMatrixAndVector(n) {
    const A = Array.from({ length: n }, () => Array(n))
    const b = Array(n)
    const matrixAInputs = matrixInputsDiv.querySelectorAll('.matrixA')
    const vectorBInputs = matrixInputsDiv.querySelectorAll('.vectorB')
    matrixAInputs.forEach(input => {
      const i = +input.dataset.row
      const j = +input.dataset.col
      A[i][j] = parseFloat(input.value)
    })
    vectorBInputs.forEach(input => {
      const i = +input.dataset.row
      b[i] = parseFloat(input.value)
    })
    return { A, b }
  }

  function showInputMode(mode) {
    if (mode === 'grid') {
      matrixInputsDiv.style.display = ''
      matrixTextareaDiv.style.display = 'none'
      matrixSizeInput.style.display = ''
      matrixSizeLabel.style.display = ''
    } else {
      matrixInputsDiv.style.display = 'none'
      matrixTextareaDiv.style.display = 'flex'
      matrixSizeInput.style.display = 'none'
      matrixSizeLabel.style.display = 'none'
    }
  }
  function setRequiredInputs(mode) {
    // Grid mode: grid inputs required, textareas not required
    if (mode === 'grid') {
      matrixInputsDiv
        .querySelectorAll('input')
        .forEach(input => (input.required = true))
      matrixAtext.required = false
      vectorBtext.required = false
    } else {
      matrixInputsDiv
        .querySelectorAll('input')
        .forEach(input => (input.required = false))
      matrixAtext.required = true
      vectorBtext.required = true
    }
  }

  if (inputModeSelect) {
    inputModeSelect.addEventListener('change', e => {
      showInputMode(inputModeSelect.value)
      setRequiredInputs(inputModeSelect.value)
    })
    showInputMode(inputModeSelect.value)
    setRequiredInputs(inputModeSelect.value)
  }

  function getMatrixAndVectorText() {
    const A = matrixAtext.value
      .trim()
      .split(/\r?\n/)
      .map(row => row.trim().split(/\s+/).map(Number))
    const b = vectorBtext.value.trim().split(/\s+/).map(Number)
    return { A, b }
  }

  // Inicializa com tamanho padrão
  renderMatrixInputs(+matrixSizeInput.value)
  matrixSizeInput.addEventListener('change', e => {
    let n = Math.max(2, Math.min(8, +matrixSizeInput.value || 3))
    matrixSizeInput.value = n
    renderMatrixInputs(n)
  })

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    const n = +matrixSizeInput.value
    const resultadoDiv = document.getElementById('resultado')
    try {
      let A, b
      if (inputModeSelect.value === 'grid') {
        ;({ A, b } = getMatrixAndVector(n))
      } else {
        ;({ A, b } = getMatrixAndVectorText())
      }
      if (A.length !== b.length)
        throw new Error('Matrix and vector size mismatch.')
      const x = gaussElimination(A, b)
      resultadoDiv.textContent =
        'x = [' + x.map(v => v.toPrecision(6)).join(', ') + ']'
      resultadoDiv.classList.remove('blink')
      void resultadoDiv.offsetWidth
      resultadoDiv.classList.add('blink')
    } catch (err) {
      resultadoDiv.textContent = 'Error: ' + err.message
    }
  })
})

function gaussElimination(A, b) {
  // Print A
  for (let i = 0; i < A.length; i++) {
    console.log(`Row ${i}:`, A[i].join(' '))
  }
  console.log('Vector b:', b.join(' '))
  const n = A.length
  for (let i = 0; i < n; i++) {
    // Partial pivoting
    let iPivot = findMax(A, i, n)
    if (i !== iPivot) {
      // Swap rows
      ;[A[i], A[iPivot]] = [A[iPivot], A[i]]
      ;[b[i], b[iPivot]] = [b[iPivot], b[i]]
    }

    // Elimination
    for (let j = i + 1; j < n; j++) {
      const m = A[j][i] / A[i][i]
      A[j][i] = 0 // Set the pivot column to zero
      for (let k = i + 1; k < n; k++) {
        A[j][k] -= m * A[i][k]
      }
      b[j] -= m * b[i]
    }

    // Print the current state of A and b
    console.log(`After elimination step ${i + 1}:`)
    for (let j = 0; j < n; j++) {
      console.log(`Row ${j}:`, A[j].join(' '), '|', b[j])
    }
    console.log('---')
  }

  console.log('Matrix A after elimination:', A)

  const x = backSubstitution(A, b)
  return x
}

function backSubstitution(A, b) {
  const n = A.length
  let x = Array(n).fill(0)

  for (let i = n - 1; i >= 0; i--) {
    x[i] = b[i]
    for (let j = i + 1; j < n; j++) {
      x[i] -= A[i][j] * x[j]
    }
    x[i] /= A[i][i]
  }

  return x
}

function findMax(A, i, n) {
  let maxRow = i
  for (let k = i + 1; k < n; k++) {
    if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
      maxRow = k
    }
  }
  return maxRow
}
