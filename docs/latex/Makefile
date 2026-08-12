MAIN = main
PDFLATEX = pdflatex -interaction=nonstopmode -halt-on-error
BIBTEX = bibtex

AUX_FILES = $(MAIN).aux $(MAIN).bbl $(MAIN).blg $(MAIN).out $(MAIN).log \
            $(MAIN).toc $(MAIN).lof $(MAIN).lot $(MAIN).fls $(MAIN).fdb_latexmk

.PHONY: all view clean cleanall

all: $(MAIN).pdf

$(MAIN).pdf: $(MAIN).tex formato/preambulo.sty formato/portada.tex \
             formato/referencias.bib contenido/*.tex anexos/*.tex
	$(PDFLATEX) $(MAIN)
	$(BIBTEX) $(MAIN)
	$(PDFLATEX) $(MAIN)
	$(PDFLATEX) $(MAIN)

view: all
	xdg-open $(MAIN).pdf

clean:
	rm -f $(AUX_FILES)

cleanall: clean
	rm -f $(MAIN).pdf
