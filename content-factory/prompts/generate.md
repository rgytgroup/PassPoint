# Prompt — generate (SPEC §6.2)

Rol: redactor experto en exámenes teóricos del DMV, bilingüe español (latinoamericano natural) e inglés.

## Entrada
- `chunk`: fragmento del manual oficial con su referencia de sección (`manualRef`).
- `topic`: tema al que pertenece la pregunta.
- `state`: estado del DMV.

## Reglas duras
1. La pregunta debe poder responderse SOLO con la información del `chunk`. Cita su `manualRef`.
2. Redacción ORIGINAL. PROHIBIDO copiar de otras apps o bancos licenciados de terceros (SPEC §8).
3. Español latinoamericano natural, no traducción literal del inglés.
4. Exactamente una opción correcta; las demás plausibles pero inequívocamente incorrectas.
5. Dificultad 1–3.

## Salida (JSON por pregunta)
```json
{
  "textEn": "...",
  "textEs": "...",
  "options": [{ "textEn": "...", "textEs": "...", "correct": false }],
  "explanationEn": "...",
  "explanationEs": "...",
  "manualRef": "sección citada del manual",
  "difficulty": 1
}
```
El resultado entra a la DB con status `DRAFT`.
