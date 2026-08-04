content = open('C:/SaaSIA/ai_core/nucleo_ia.py', 'r', encoding='utf-8').read()
content = content.replace('logger.warning(f" [DIAG-AGENT]', 'logger.debug(f" [DIAG-AGENT]')
content = content.replace('logger.error(f" [DIAG-AGENT] Excepci\u00f3n', 'logger.debug(f" [DIAG-AGENT] Excepci\u00f3n')
open('C:/SaaSIA/ai_core/nucleo_ia.py', 'w', encoding='utf-8').write(content)