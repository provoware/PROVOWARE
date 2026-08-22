# CHECKPOINT 0.4.2-H1 – Persistence Portability Foundation

Baseline `main`: `9794828aa4dbe95d3a97bf6541fca008956c2056`

Feature-Branch: `feat/0.4.2-h1-persistence-portability`

## Ausgangslage

- Project Data und Data Studio PRO besitzen zwei getrennte atomare Writer mit praktisch identischer Temp-/Rename-/Cleanup-Logik.
- beide Dateiformate und Fachvalidierungen sind stabil und dürfen durch H1 nicht verändert werden.
- bestehende Failure-Injection greift jeweils direkt vor `rename`.
- Windows-spezifische Lock-/Replace-Semantik ist noch nicht als eigenes CI-Gate abgenommen.
- 0.4.3 Recovery Envelope ist bewusst nach H1/H1b eingeordnet.

## H1-Grenze

H1 vereinheitlicht nur die interne Persistenzsemantik. Echte Windows-CI folgt in H1b; Multi-Datei-Recovery folgt in 0.4.3.
