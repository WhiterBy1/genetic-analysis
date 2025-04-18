/**
 * Data Processor Module
 * Handles loading, parsing, and processing gene data from CSV files
 */

// Import PapaParse (assuming it's available globally or via a module loader)
// If using a module loader (e.g., Webpack, Browserify), use:
// import Papa from 'papaparse';
// Otherwise, ensure PapaParse is included in your HTML before this script.
const Papa = window.Papa // Assuming PapaParse is loaded globally

// Global data store
const geneData = {
  genes: ["CACNA1C", "COMT", "DAOA", "DISC1", "GRM3", "NRG1"],
  data: {},
  summaries: {},
  isLoaded: false,
}

// Gene descriptions
const geneDescriptions = {
  CACNA1C:
    "Canal de calcio tipo L, subunidad alfa 1C. Implicado en la señalización neuronal y asociado con esquizofrenia y trastorno bipolar.",
  COMT: "Catecol-O-metiltransferasa. Enzima que degrada catecolaminas como la dopamina, neurotransmisor implicado en la esquizofrenia.",
  DAOA: "Activador de la D-aminoácido oxidasa. Modula la función del receptor NMDA, implicado en la hipótesis glutamatérgica de la esquizofrenia.",
  DISC1:
    "Disrupted in Schizophrenia 1. Proteína scaffold involucrada en múltiples procesos neuronales, incluyendo neurogénesis y migración neuronal.",
  GRM3: "Receptor metabotrópico de glutamato 3. Implicado en la neurotransmisión glutamatérgica, alterada en la esquizofrenia.",
  NRG1: "Neuregulina 1. Factor de crecimiento implicado en el desarrollo neuronal, mielinización y plasticidad sináptica.",
}

/**
 * Loads all gene data from CSV files
 * @returns {Promise} Promise that resolves when all data is loaded
 */
function loadAllGeneData() {
  const loadingPromises = geneData.genes.map((gene) => loadGeneData(gene))
  return Promise.all(loadingPromises)
    .then(() => {
      geneData.isLoaded = true
      console.log("All gene data loaded successfully")

      // Process summaries after all data is loaded
      processGeneSummaries()
      return geneData
    })
    .catch((error) => {
      console.error("Error loading gene data:", error)
      document.getElementById("data-loading-status").textContent =
        "Error cargando datos. Por favor, recargue la página."
    })
}

/**
 * Loads data for a specific gene from CSV file
 * @param {string} gene - Gene name
 * @returns {Promise} Promise that resolves when data is loaded
 */
function loadGeneData(gene) {
  return new Promise((resolve, reject) => {
    // Path to the CSV file
    const filePath = `data/${gene}.csv`

    // Use Papa Parse to load and parse the CSV file
    Papa.parse(filePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.error(`Error parsing ${gene} CSV:`, results.errors)
          reject(results.errors)
          return
        }

        // Process the data
        geneData.data[gene] = processGeneData(results.data)
        resolve(results.data)
      },
      error: (error) => {
        console.error(`Error loading ${gene} CSV:`, error)
        reject(error)
      },
    })
  })
}

/**
 * Processes raw gene data into a more usable format
 * @param {Array} rawData - Raw data from CSV
 * @returns {Object} Processed data
 */
function processGeneData(rawData) {
  // Clean and transform data
  const processedData = rawData.map((row) => {
    return {
      variantId: row["Variant ID"],
      hgvs: row["HGVSp/c"],
      consequence: row["Consequence"],
      acCase: Number.parseInt(row["AC Case"]) || 0,
      anCase: Number.parseInt(row["AN Case"]) || 0,
      acControl: Number.parseInt(row["AC Control"]) || 0,
      anControl: Number.parseInt(row["AN Control"]) || 0,
      afCase: Number.parseFloat(row["AF Case"]) || 0,
      afControl: Number.parseFloat(row["AF Control"]) || 0,
      deNovos: Number.parseInt(row["No. de novos"]) || 0,
      pVal: Number.parseFloat(row["P-Val"]),
      estimate: Number.parseFloat(row["Estimate"]),
      inAnalysis: row["In Analysis"] === "yes",
      // Extract consequence type (without MPC score details)
      consequenceType: extractConsequenceType(row["Consequence"]),
      // Extract position from variant ID
      position: extractPosition(row["Variant ID"]),
      // Is the variant significant?
      isSignificant: Number.parseFloat(row["P-Val"]) < 0.05,
      // Is the variant exclusive to cases?
      isCaseOnly: Number.parseInt(row["AC Case"]) > 0 && Number.parseInt(row["AC Control"]) === 0,
      // Is the variant exclusive to controls?
      isControlOnly: Number.parseInt(row["AC Case"]) === 0 && Number.parseInt(row["AC Control"]) > 0,
    }
  })

  return processedData
}

/**
 * Extracts the basic consequence type from the full consequence string
 * @param {string} consequence - Full consequence string
 * @returns {string} Basic consequence type
 */
function extractConsequenceType(consequence) {
  if (!consequence) return "unknown"

  if (consequence.includes("missense")) return "missense"
  if (consequence.includes("synonymous")) return "synonymous"
  if (consequence.includes("intron")) return "intron"
  if (consequence.includes("5' UTR")) return "5_prime_UTR"
  if (consequence.includes("3' UTR")) return "3_prime_UTR"
  if (consequence.includes("splice")) return "splice_region"
  if (consequence.includes("frameshift")) return "frameshift"
  if (consequence.includes("upstream")) return "upstream"
  if (consequence.includes("start lost")) return "start_lost"

  return "other"
}

/**
 * Extracts position from variant ID
 * @param {string} variantId - Variant ID string (format: chr-pos-ref-alt)
 * @returns {number} Position
 */
function extractPosition(variantId) {
  if (!variantId) return null

  const parts = variantId.split("-")
  if (parts.length >= 2) {
    return Number.parseInt(parts[1])
  }

  return null
}

/**
 * Processes summaries for all genes
 */
function processGeneSummaries() {
  geneData.genes.forEach((gene) => {
    if (geneData.data[gene]) {
      geneData.summaries[gene] = calculateGeneSummary(gene)
    }
  })

  // Calculate multigenic summaries
  calculateMultigenicSummaries()
}

/**
 * Calculates summary statistics for a gene
 * @param {string} gene - Gene name
 * @returns {Object} Summary statistics
 */
function calculateGeneSummary(gene) {
  const data = geneData.data[gene]

  // Count variants by consequence type
  const consequenceCounts = {}
  data.forEach((variant) => {
    const type = variant.consequenceType
    consequenceCounts[type] = (consequenceCounts[type] || 0) + 1
  })

  // Count case-only and control-only variants
  const caseOnly = data.filter((v) => v.isCaseOnly).length
  const controlOnly = data.filter((v) => v.isControlOnly).length

  // Count significant variants
  const significant = data.filter((v) => v.isSignificant).length

  // Calculate average frequencies
  const avgAfCase = data.reduce((sum, v) => sum + (v.afCase || 0), 0) / data.length
  const avgAfControl = data.reduce((sum, v) => sum + (v.afControl || 0), 0) / data.length

  // Find variants with high impact (missense with MPC ≥ 2 or frameshift)
  const highImpact = data.filter(
    (v) =>
      (v.consequence && v.consequence.includes("MPC ≥ 2")) ||
      (v.consequence && v.consequence.includes("MPC ≥ 3")) ||
      v.consequenceType === "frameshift" ||
      v.consequenceType === "start_lost",
  ).length

  return {
    totalVariants: data.length,
    consequenceCounts,
    caseOnly,
    controlOnly,
    significant,
    avgAfCase,
    avgAfControl,
    highImpact,
  }
}

/**
 * Calculates multigenic summary statistics
 */
function calculateMultigenicSummaries() {
  // This will hold our multigenic analysis
  const multigenic = {
    comparisonTable: [],
    findings: [],
  }

  // Create comparison table data
  geneData.genes.forEach((gene) => {
    const summary = geneData.summaries[gene]

    if (summary) {
      multigenic.comparisonTable.push({
        gene,
        totalVariants: summary.totalVariants,
        caseOnly: summary.caseOnly,
        missense: summary.consequenceCounts["missense"] || 0,
        significant: summary.significant,
        highImpact: summary.highImpact,
      })
    }
  })

  // Sort genes by total variants
  multigenic.comparisonTable.sort((a, b) => b.totalVariants - a.totalVariants)

  // Generate findings based on the data
  // Find gene with most variants
  const mostVariants = multigenic.comparisonTable[0]
  multigenic.findings.push(
    `<strong>Distribución de variantes:</strong> ${mostVariants.gene} presenta el mayor número total de variantes (${mostVariants.totalVariants}), seguido por ${multigenic.comparisonTable[1].gene} (${multigenic.comparisonTable[1].totalVariants}) y ${multigenic.comparisonTable[2].gene} (${multigenic.comparisonTable[2].totalVariants}).`,
  )

  // Find genes with most case-only variants
  multigenic.comparisonTable.sort((a, b) => b.caseOnly - a.caseOnly)
  const mostCaseOnly = multigenic.comparisonTable[0]
  multigenic.findings.push(
    `<strong>Variantes exclusivas:</strong> ${mostCaseOnly.gene} y ${multigenic.comparisonTable[1].gene} muestran el mayor número de variantes exclusivas en casos (${mostCaseOnly.caseOnly} y ${multigenic.comparisonTable[1].caseOnly} respectivamente), lo que podría sugerir un papel más específico en la patogénesis de la esquizofrenia.`,
  )

  // Find genes with most significant variants
  multigenic.comparisonTable.sort((a, b) => b.significant - a.significant)
  const mostSignificant = multigenic.comparisonTable[0]
  if (mostSignificant.significant > 0) {
    multigenic.findings.push(
      `<strong>Significancia estadística:</strong> ${mostSignificant.gene} y ${multigenic.comparisonTable[1].gene} presentan el mayor número de variantes con asociación estadísticamente significativa (${mostSignificant.significant} y ${multigenic.comparisonTable[1].significant} respectivamente), lo que refuerza su importancia como genes candidatos.`,
    )
  } else {
    multigenic.findings.push(
      `<strong>Significancia estadística:</strong> Pocos genes muestran variantes con asociación estadísticamente significativa, lo que sugiere que se necesitan estudios con muestras más grandes para detectar asociaciones robustas.`,
    )
  }

  // Find genes with most missense variants
  multigenic.comparisonTable.sort((a, b) => b.missense - a.missense)
  const mostMissense = multigenic.comparisonTable[0]
  multigenic.findings.push(
    `<strong>Tipos de consecuencia:</strong> Las variantes missense son predominantes en todos los genes, pero su distribución varía, siendo más frecuentes en ${mostMissense.gene} (${mostMissense.missense}) y ${multigenic.comparisonTable[1].gene} (${multigenic.comparisonTable[1].missense}).`,
  )

  // Find genes with most high impact variants
  multigenic.comparisonTable.sort((a, b) => b.highImpact - a.highImpact)
  const mostHighImpact = multigenic.comparisonTable[0]
  multigenic.findings.push(
    `<strong>Variantes de alto impacto:</strong> ${mostHighImpact.gene} y ${multigenic.comparisonTable[1].gene} contienen el mayor número de variantes predichas como de alto impacto funcional (${mostHighImpact.highImpact} y ${multigenic.comparisonTable[1].highImpact} respectivamente).`,
  )

  // Add overall conclusion
  multigenic.findings.push(
    `<strong>Conclusión general:</strong> El análisis comparativo de los seis genes estudiados sugiere que, aunque todos muestran asociaciones con esquizofrenia, existen diferencias importantes en el tipo, número y significancia de las variantes identificadas. Esto apoya la naturaleza poligénica de la esquizofrenia, donde múltiples genes contribuyen al riesgo de desarrollar la enfermedad.`,
  )

  // Store in global data
  geneData.multigenic = multigenic
}

// Export functions for use in other modules
window.dataProcessor = {
  loadAllGeneData,
  geneData,
  geneDescriptions,
}
