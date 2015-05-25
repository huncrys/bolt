<?php
namespace Bolt\Field\Type;

use Doctrine\DBAL\Query\QueryBuilder;
use Bolt\Mapping\ClassMetadata;
use Bolt\Storage\EntityManager;
use Bolt\Storage\QuerySet;

/**
 * This is an abstract class for a field type that handles
 * the lifecycle of a field from pre-query to persist.
 *
 * @author Ross Riley <riley.ross@gmail.com>
 */
abstract class FieldTypeBase implements FieldTypeInterface
{
    
    public $mapping;
    
    public function __construct(array $mapping = array())
    {
        $this->mapping = $mapping;
    }
    
    /**
     * Handle or ignore the load event.
     * 
     * @param QueryBuilder $query
     *
     * @return void
     */
    public function load(QueryBuilder $query, ClassMetadata $metadata)
    {
        return $query;
    }
    
    /**
     * Handle or ignore the persist event.
     *
     * @return void
     */
    public function persist(QuerySet $queries, $entity, EntityManager $em = null)
    {
        
    }
    
    /**
     * Handle or ignore the hydrate event.
     *
     * @return void
     */
    public function hydrate($data, $entity, EntityManager $em = null)
    {
        
    }
    
    /**
     * Handle or ignore the present event.
     *
     * @return void
     */
    public function present($entity)
    {
        
    }
    
    /**
     * Returns the name of the hydrator.
     *
     * @return string The field name
     */
    public function getName()
    {
        return 'text';
    }
    

    
}
