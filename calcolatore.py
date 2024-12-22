from IPython.display import display, HTML, clear_output
import ipywidgets as widgets
import pandas as pd

def trova_combinazioni_serie(resistenze_disponibili, valore_target, tolleranza=0.05, max_resistenze=3):
    """
    Trova le combinazioni di resistenze in serie che si avvicinano al valore target.
    """
    risultati = []
    
    def cerca_combinazioni(valori_attuali, somma_attuale, indice_iniziale):
        if len(valori_attuali) > max_resistenze:
            return
            
        if valori_attuali:
            errore = abs(somma_attuale - valore_target) / valore_target
            if errore <= tolleranza:
                risultati.append((
                    valori_attuali.copy(),
                    somma_attuale,
                    errore * 100
                ))
        
        for i in range(indice_iniziale, len(resistenze_disponibili)):
            nuovo_valore = resistenze_disponibili[i]
            cerca_combinazioni(
                valori_attuali + [nuovo_valore],
                somma_attuale + nuovo_valore,
                i
            )
    
    cerca_combinazioni([], 0, 0)
    return sorted(risultati, key=lambda x: x[2])

def trova_combinazioni_parallelo(resistenze_disponibili, valore_target, tolleranza=0.05, max_resistenze=3):
    """
    Trova le combinazioni di resistenze in parallelo che si avvicinano al valore target.
    """
    risultati = []
    
    def cerca_combinazioni(valori_attuali, indice_iniziale):
        if len(valori_attuali) > max_resistenze:
            return
            
        if valori_attuali:
            r_totale = 1 / sum(1/r for r in valori_attuali)
            errore = abs(r_totale - valore_target) / valore_target
            if errore <= tolleranza:
                risultati.append((
                    valori_attuali.copy(),
                    r_totale,
                    errore * 100
                ))
        
        for i in range(indice_iniziale, len(resistenze_disponibili)):
            nuovo_valore = resistenze_disponibili[i]
            cerca_combinazioni(
                valori_attuali + [nuovo_valore],
                i
            )
    
    cerca_combinazioni([], 0)
    return sorted(risultati, key=lambda x: x[2])

# Widget per l'input delle resistenze disponibili
resistenze_text = widgets.Textarea(
    value='330, 390, 325, 15, 18, 560, 670, 390, 150, 39, 100000, 45000, 9700, 2700, 1000, 5600, 47000, 10, 22, 46400, 99500, 460, 54000, 960, 22000, 2100, 100, 1500',
    description='Resistenze disponibili (Ω):',
    layout={'width': '500px', 'height': '100px'}
)

# Widget per il valore target
target_value = widgets.FloatText(
    value=1500,
    description='Valore target (Ω):',
    layout={'width': '300px'}
)

# Widget per la tolleranza
tolerance_slider = widgets.FloatSlider(
    value=5,
    min=1,
    max=20,
    step=0.5,
    description='Tolleranza (%):',
    layout={'width': '300px'}
)

# Widget per il numero massimo di resistenze
max_resistors = widgets.IntSlider(
    value=3,
    min=1,
    max=5,
    step=1,
    description='Max resistenze:',
    layout={'width': '300px'}
)

# Widget per selezionare il tipo di connessione
connection_type = widgets.RadioButtons(
    options=['Serie', 'Parallelo', 'Entrambi'],
    description='Tipo connessione:',
    layout={'width': 'max-content'}
)

# Bottone per calcolare
calculate_button = widgets.Button(
    description='Calcola combinazioni',
    button_style='primary',
    layout={'width': 'max-content'}
)

# Output widget per i risultati
output = widgets.Output()

def format_results(results, connection_type):
    """Formatta i risultati in una tabella HTML"""
    if not results:
        return f"<p>Nessuna combinazione {connection_type} trovata entro la tolleranza specificata.</p>"
    
    html = f"<h3>Combinazioni {connection_type}</h3>"
    html += """
    <table border="1" style="border-collapse: collapse; margin: 10px;">
        <tr>
            <th style="padding: 8px;">Resistenze (Ω)</th>
            <th style="padding: 8px;">Valore totale (Ω)</th>
            <th style="padding: 8px;">Errore (%)</th>
        </tr>
    """
    
    for combo, value, error in results[:5]:  # Mostra solo le prime 5 combinazioni
        html += f"""
        <tr>
            <td style="padding: 8px;">{' + '.join(map(str, combo))}</td>
            <td style="padding: 8px;">{value:.1f}</td>
            <td style="padding: 8px;">{error:.1f}</td>
        </tr>
        """
    
    html += "</table>"
    return html

def on_calculate_button_clicked(b):
    with output:
        clear_output()
        
        try:
            # Converti la stringa delle resistenze in lista di numeri
            resistenze = [float(r.strip()) for r in resistenze_text.value.split(',')]
            
            # Ottieni i parametri dai widget
            target = target_value.value
            toll = tolerance_slider.value / 100
            max_r = max_resistors.value
            conn_type = connection_type.value
            
            html_output = "<h2>Risultati:</h2>"
            
            if conn_type in ['Serie', 'Entrambi']:
                results_serie = trova_combinazioni_serie(resistenze, target, toll, max_r)
                html_output += format_results(results_serie, 'in serie')
            
            if conn_type in ['Parallelo', 'Entrambi']:
                results_parallel = trova_combinazioni_parallelo(resistenze, target, toll, max_r)
                html_output += format_results(results_parallel, 'in parallelo')
            
            display(HTML(html_output))
            
        except ValueError as e:
            display(HTML("<p style='color: red'>Errore: Assicurati che tutti i valori delle resistenze siano numeri validi.</p>"))
        except Exception as e:
            display(HTML(f"<p style='color: red'>Errore: {str(e)}</p>"))

# Collega il bottone alla funzione
calculate_button.on_click(on_calculate_button_clicked)

# Mostra i widget
display(resistenze_text)
display(target_value)
display(tolerance_slider)
display(max_resistors)
display(connection_type)
display(calculate_button)
display(output)
