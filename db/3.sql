-- Tout les établissement avec maximum un commentaire.

SELECT c.establishment_id
FROM comments c
GROUP BY c.establishment_id HAVING COUNT(c.establishment_id)<=1;
