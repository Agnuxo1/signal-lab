# v1 · protocolo legado conservado

Esta carpeta conserva la primera formulación del proyecto: biblioteca de grabaciones para monedas, basura metálica y condiciones ambientales, con ciclos por orientación y profundidad. La v1 usaba una secuencia fija y distinguía captura por cable de manos libres.

La v2 no elimina esa idea. La formaliza como contratos de dominio, perfiles de detector, almacenamiento local y manifest versionado. Si se recupera un dataset antiguo, debe documentarse su origen y mapearse a `signal-lab/session@2` sin sobrescribir los archivos originales.

## Compatibilidad

- Profundidades históricas de 5, 10, 15, 20 y 25 cm siguen siendo válidas en el modelo.
- La interfaz actual arranca en 5 cm para acelerar la biblioteca inicial.
- Los nombres de objetivos y modos antiguos deben conservarse como notas durante la migración.

## Regla de conservación

No se reemplaza un protocolo histórico por una edición silenciosa. Se añade `v2`, se registra el cambio y se mantiene este documento como referencia.
