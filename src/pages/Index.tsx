import Homepage from './Homepage';

const Index = () => {
  return (
    <div>
      {/* Admin Debug Link - Remove after testing */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999, background: 'red', color: 'white', padding: '10px', borderRadius: '5px' }}>
        <a href="/admin" style={{ color: 'white', textDecoration: 'underline' }}>
          🚨 ADMIN TEST LINK
        </a>
      </div>
      <Homepage />
    </div>
  );
};

export default Index;
