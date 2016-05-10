-- La liste des labels étant appliqués à au moins 5 établissements, 
-- classée selon la moyenne des scores des établissements ayant ce label.

SELECT AVG(c.rating), l.name
FROM label AS l
    JOIN comments AS c
        ON c.establishment_id=l.establishment_id
GROUP BY l.name HAVING COUNT(DISTINCT l.establishment_id)>=5
ORDER BY AVG(c.rating)
;
